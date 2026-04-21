import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/turno.dart';

class ApiService {
  // Cambiá esta URL por la del servidor en producción
  static const String baseUrl = 'http://192.168.101.26:8080/api';

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<Map<String, String>> _headers({bool auth = true}) async {
    final h = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await _getToken();
      if (token != null) h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  static Future<String> login(String username, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await _headers(auth: false),
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (res.statusCode == 200) {
      final token = jsonDecode(res.body)['token'] as String;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      return token;
    }
    throw Exception(jsonDecode(res.body)['detail'] ?? 'Credenciales incorrectas');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<bool> isLoggedIn() async {
    final token = await _getToken();
    return token != null && token.isNotEmpty;
  }

  // ── Turnos ──────────────────────────────────────────────────────────────────
  static Future<List<Turno>> getTodos() async {
    final res = await http.get(
      Uri.parse('$baseUrl/turnos'),
      headers: await _headers(),
    );
    _checkAuth(res);
    final List data = jsonDecode(utf8.decode(res.bodyBytes));
    return data.map((j) => Turno.fromJson(j)).toList();
  }

  static Future<List<Turno>> getHoy() async {
    final res = await http.get(
      Uri.parse('$baseUrl/turnos/hoy'),
      headers: await _headers(),
    );
    _checkAuth(res);
    final List data = jsonDecode(utf8.decode(res.bodyBytes));
    return data.map((j) => Turno.fromJson(j)).toList();
  }

  static Future<List<Turno>> getDia(DateTime fecha) async {
    final iso = '${fecha.year.toString().padLeft(4,'0')}-'
        '${fecha.month.toString().padLeft(2,'0')}-'
        '${fecha.day.toString().padLeft(2,'0')}T00:00:00';
    final res = await http.get(
      Uri.parse('$baseUrl/turnos/dia?fecha=$iso'),
      headers: await _headers(),
    );
    _checkAuth(res);
    final List data = jsonDecode(utf8.decode(res.bodyBytes));
    return data.map((j) => Turno.fromJson(j)).toList();
  }

  static Future<List<Turno>> buscar(String q) async {
    final res = await http.get(
      Uri.parse('$baseUrl/turnos/buscar?q=${Uri.encodeComponent(q)}'),
      headers: await _headers(),
    );
    _checkAuth(res);
    final List data = jsonDecode(utf8.decode(res.bodyBytes));
    return data.map((j) => Turno.fromJson(j)).toList();
  }

  static Future<List<String>> getOcupados(DateTime fecha) async {
    final iso = '${fecha.year.toString().padLeft(4,'0')}-'
        '${fecha.month.toString().padLeft(2,'0')}-'
        '${fecha.day.toString().padLeft(2,'0')}T00:00:00';
    final res = await http.get(Uri.parse('$baseUrl/turnos/ocupados?fecha=$iso'));
    final List data = jsonDecode(utf8.decode(res.bodyBytes));
    return data.map<String>((t) => (t['fechaHora'] as String).substring(11, 16)).toList();
  }

  static Future<void> confirmar(int id) => _accion(id, 'confirmar');
  static Future<void> cancelar(int id)  => _accion(id, 'cancelar');
  static Future<void> completar(int id) => _accion(id, 'completar');

  static Future<void> _accion(int id, String accion) async {
    final res = await http.put(
      Uri.parse('$baseUrl/turnos/$id/$accion'),
      headers: await _headers(),
    );
    _checkAuth(res);
    if (res.statusCode != 200) throw Exception('Error al $accion turno');
  }

  static Future<Turno> crearTurno({
    required String clienteNombre,
    required String clienteTelefono,
    required String fechaHora,
    required String servicio,
    String? notas,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/turnos'),
      headers: await _headers(),
      body: jsonEncode({
        'clienteNombre':   clienteNombre,
        'clienteTelefono': clienteTelefono,
        'fechaHora':       fechaHora,
        'servicio':        servicio,
        if (notas != null && notas.isNotEmpty) 'notas': notas,
      }),
    );
    if (res.statusCode == 201) return Turno.fromJson(jsonDecode(utf8.decode(res.bodyBytes)));
    throw Exception(jsonDecode(res.body)['detail'] ?? 'Error al crear turno');
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  static Future<List<String>> getServicios() async {
    final res = await http.get(Uri.parse('$baseUrl/config/servicios'));
    final data = jsonDecode(utf8.decode(res.bodyBytes));
    return List<String>.from(data['servicios']);
  }

  static Future<Map<String, dynamic>> getDisponibilidad() async {
    final res = await http.get(Uri.parse('$baseUrl/config/disponibilidad'));
    return jsonDecode(utf8.decode(res.bodyBytes));
  }

  static void _checkAuth(http.Response res) {
    if (res.statusCode == 401 || res.statusCode == 403) {
      throw UnauthorizedException();
    }
  }
}

class UnauthorizedException implements Exception {}
