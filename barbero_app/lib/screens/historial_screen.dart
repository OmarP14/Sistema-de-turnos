import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/turno.dart';
import '../services/api_service.dart';
import '../widgets/turno_card.dart';

class HistorialScreen extends StatefulWidget {
  const HistorialScreen({super.key});
  @override
  State<HistorialScreen> createState() => _HistorialScreenState();
}

class _HistorialScreenState extends State<HistorialScreen> {
  List<Turno> _todos = [];
  List<Turno> _filtrados = [];
  bool _cargando = true;
  final _busqCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() => _cargando = true);
    try {
      final turnos = await ApiService.getTodos();
      turnos.sort((a, b) => b.fechaHora.compareTo(a.fechaHora));
      setState(() { _todos = turnos; _filtrados = turnos; });
    } catch (e) {
      if (e is UnauthorizedException && mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  void _buscar(String q) {
    final lower = q.toLowerCase();
    setState(() {
      _filtrados = _todos.where((t) =>
        t.clienteNombre.toLowerCase().contains(lower) ||
        t.clienteTelefono.contains(q) ||
        (t.servicio?.toLowerCase().contains(lower) ?? false)
      ).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060d1a),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('HISTORIAL',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900,
                letterSpacing: 2, color: Color(0xFFF8F8F8))),
            const SizedBox(height: 12),
            TextField(
              controller: _busqCtrl,
              onChanged: _buscar,
              style: const TextStyle(color: Color(0xFFF8F8F8)),
              decoration: InputDecoration(
                hintText: 'Buscar por nombre, teléfono o servicio...',
                hintStyle: const TextStyle(color: Color(0xFF334155), fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF475569), size: 18),
                suffixIcon: _busqCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close, color: Color(0xFF475569), size: 18),
                      onPressed: () { _busqCtrl.clear(); _buscar(''); })
                  : null,
                filled: true, fillColor: const Color(0xFF0d1117),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
                  borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
                  borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
                  borderSide: const BorderSide(color: Color(0xFFE8192C))),
              ),
            ),
          ]),
        ),
        Expanded(
          child: _cargando
            ? const Center(child: CircularProgressIndicator(color: Color(0xFFE8192C)))
            : _filtrados.isEmpty
              ? const Center(child: Text('Sin resultados',
                  style: TextStyle(color: Color(0xFF334155))))
              : RefreshIndicator(
                  onRefresh: _cargar,
                  color: const Color(0xFFE8192C),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _filtrados.length,
                    itemBuilder: (_, i) =>
                      TurnoCard(turno: _filtrados[i], onActualizar: _cargar),
                  ),
                ),
        ),
      ]),
    );
  }
}
