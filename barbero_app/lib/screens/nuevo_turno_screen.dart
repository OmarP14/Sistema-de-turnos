import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

// ─── Franjas horarias ─────────────────────────────────────────────────────────
List<String> _generarFranja(int desdeH, int hastaH) {
  final slots = <String>[];
  for (var t = desdeH * 60; t <= hastaH * 60; t += 30) {
    final h = (t ~/ 60).toString().padLeft(2, '0');
    final m = (t % 60).toString().padLeft(2, '0');
    slots.add('$h:$m');
  }
  return slots;
}

final _franjaMañana = _generarFranja(9, 13);
final _franjaTarde  = _generarFranja(17, 22);

class NuevoTurnoScreen extends StatefulWidget {
  const NuevoTurnoScreen({super.key});
  @override
  State<NuevoTurnoScreen> createState() => _NuevoTurnoScreenState();
}

class _NuevoTurnoScreenState extends State<NuevoTurnoScreen> {
  final _nombreCtrl = TextEditingController();
  final _telCtrl    = TextEditingController();
  final _notasCtrl  = TextEditingController();

  List<String> _servicios = [];
  String? _servicioSel;
  DateTime _fechaSel = DateTime.now();
  String? _horaSel;
  List<String> _ocupados = [];
  List<int> _diasLaborales = [1, 2, 3, 4, 5, 6];
  List<String> _fechasBloqueadas = [];

  bool _loading = false;
  bool _cargandoOcupados = false;
  String _error = '';

  // Para el selector de mes en el calendario
  late DateTime _mesActual;

  @override
  void initState() {
    super.initState();
    _mesActual = DateTime(_fechaSel.year, _fechaSel.month, 1);
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
    try {
      final svcs = await ApiService.getServicios();
      final disp = await ApiService.getDisponibilidad();
      setState(() {
        _servicios = svcs;
        if (svcs.isNotEmpty) _servicioSel = svcs.first;
        _diasLaborales = List<int>.from(disp['diasLaborales'] ?? [1,2,3,4,5,6]);
        _fechasBloqueadas = List<String>.from(disp['fechasBloqueadas'] ?? []);
      });
      _cargarOcupados(_fechaSel);
    } catch (_) {}
  }

  Future<void> _cargarOcupados(DateTime fecha) async {
    setState(() { _cargandoOcupados = true; _horaSel = null; });
    try {
      final occ = await ApiService.getOcupados(fecha);
      setState(() => _ocupados = occ);
    } catch (_) {
      setState(() => _ocupados = []);
    } finally {
      setState(() => _cargandoOcupados = false);
    }
  }

  Future<void> _crear() async {
    if (_nombreCtrl.text.trim().isEmpty || _telCtrl.text.trim().isEmpty ||
        _servicioSel == null || _horaSel == null) {
      setState(() => _error = 'Completá todos los campos obligatorios'); return;
    }
    final soloNum = _telCtrl.text.replaceAll(RegExp(r'\D'), '');
    if (soloNum.length < 10) {
      setState(() => _error = 'Ingresá código de área + número (ej: 2644819470)'); return;
    }
    setState(() { _loading = true; _error = ''; });
    try {
      final fechaStr = DateFormat('yyyy-MM-dd').format(_fechaSel);
      await ApiService.crearTurno(
        clienteNombre:    _nombreCtrl.text.trim(),
        clienteTelefono:  '54$soloNum',
        fechaHora:        '${fechaStr}T$_horaSel:00',
        servicio:         _servicioSel!,
        notas:            _notasCtrl.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('✓ Turno creado'), backgroundColor: Color(0xFF22c55e)));
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060d1a),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0d1117),
        title: const Text('NUEVO TURNO',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900,
            letterSpacing: 2, color: Color(0xFFF8F8F8))),
        iconTheme: const IconThemeData(color: Color(0xFF64748b)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // Nombre
          _label('Nombre del cliente'),
          _textField(_nombreCtrl, 'Juan Pérez', Icons.person_outline),
          const SizedBox(height: 16),

          // Teléfono
          _label('WhatsApp del cliente'),
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF0d1117),
                border: Border.all(color: const Color(0xFF1e2d3d)),
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(6)),
              ),
              child: const Text('+54', style: TextStyle(color: Color(0xFF64748b), fontSize: 14)),
            ),
            Expanded(child: TextField(
              controller: _telCtrl, keyboardType: TextInputType.phone,
              style: const TextStyle(color: Color(0xFFF8F8F8)),
              decoration: InputDecoration(
                hintText: '2644819470', hintStyle: const TextStyle(color: Color(0xFF334155)),
                filled: true, fillColor: const Color(0xFF0d1117),
                border: const OutlineInputBorder(
                  borderRadius: BorderRadius.horizontal(right: Radius.circular(6)),
                  borderSide: BorderSide(color: Color(0xFF1e2d3d))),
                enabledBorder: const OutlineInputBorder(
                  borderRadius: BorderRadius.horizontal(right: Radius.circular(6)),
                  borderSide: BorderSide(color: Color(0xFF1e2d3d))),
                focusedBorder: const OutlineInputBorder(
                  borderRadius: BorderRadius.horizontal(right: Radius.circular(6)),
                  borderSide: BorderSide(color: Color(0xFFE8192C))),
              ),
            )),
          ]),
          const SizedBox(height: 16),

          // Servicio
          _label('Servicio'),
          Wrap(spacing: 6, runSpacing: 6,
            children: _servicios.map((s) => GestureDetector(
              onTap: () => setState(() => _servicioSel = s),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: _servicioSel == s ? const Color(0xFFE8192C).withOpacity(0.1) : const Color(0xFF0d1117),
                  border: Border.all(
                    color: _servicioSel == s ? const Color(0xFFE8192C) : const Color(0xFF1e2d3d)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(s, style: TextStyle(
                  color: _servicioSel == s ? const Color(0xFFfb7185) : const Color(0xFF64748b),
                  fontSize: 13)),
              ),
            )).toList()),
          const SizedBox(height: 16),

          // Calendario
          _label('Fecha'),
          _buildCalendario(),
          const SizedBox(height: 4),
          Text(
            DateFormat("EEEE d 'de' MMMM yyyy", 'es').format(_fechaSel),
            style: const TextStyle(color: Color(0xFF64748b), fontSize: 12)),
          const SizedBox(height: 16),

          // Horarios
          _label(_cargandoOcupados ? 'Horario  ⏳' : 'Horario'),
          _buildHorarios(),
          const SizedBox(height: 16),

          // Notas
          _label('Notas (opcional)'),
          TextField(
            controller: _notasCtrl, maxLines: 2,
            style: const TextStyle(color: Color(0xFFF8F8F8), fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Alguna preferencia especial...',
              hintStyle: const TextStyle(color: Color(0xFF334155)),
              filled: true, fillColor: const Color(0xFF0d1117),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
                borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
                borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
                borderSide: const BorderSide(color: Color(0xFFE8192C))),
            ),
          ),
          const SizedBox(height: 16),

          if (_error.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFE8192C).withOpacity(0.08),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFE8192C).withOpacity(0.3)),
              ),
              child: Text('✕ $_error', style: const TextStyle(color: Color(0xFFfb7185), fontSize: 13)),
            ),
            const SizedBox(height: 12),
          ],

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _crear,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE8192C),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
              child: _loading
                ? const SizedBox(width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('✂  CREAR TURNO',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                      letterSpacing: 1.5, color: Colors.white)),
            ),
          ),
          const SizedBox(height: 40),
        ]),
      ),
    );
  }

  Widget _buildCalendario() {
    final año = _mesActual.year;
    final mes = _mesActual.month;
    final diasEnMes = DateTime(año, mes + 1, 0).day;
    final offset = (_mesActual.weekday % 7 + 6) % 7; // Lun=0 … Dom=6
    final hoy = DateTime.now();

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0d1117),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF1e2d3d)),
      ),
      child: Column(children: [
        // Nav mes
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          IconButton(
            icon: const Icon(Icons.chevron_left, color: Color(0xFF64748b), size: 20),
            onPressed: () => setState(() => _mesActual = DateTime(año, mes - 1, 1)),
          ),
          Text(
            DateFormat('MMMM yyyy', 'es').format(_mesActual),
            style: const TextStyle(color: Color(0xFFF8F8F8), fontSize: 13,
              fontWeight: FontWeight.w600, letterSpacing: 1)),
          IconButton(
            icon: const Icon(Icons.chevron_right, color: Color(0xFF64748b), size: 20),
            onPressed: () => setState(() => _mesActual = DateTime(año, mes + 1, 1)),
          ),
        ]),
        // Cabecera días
        Row(children: ['L','M','X','J','V','S','D'].map((d) => Expanded(
          child: Center(child: Text(d, style: const TextStyle(
            color: Color(0xFF334155), fontSize: 11, fontWeight: FontWeight.w600)))
        )).toList()),
        const SizedBox(height: 4),
        // Grid días
        GridView.builder(
          shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7, childAspectRatio: 1.1, mainAxisSpacing: 2, crossAxisSpacing: 2),
          itemCount: offset + diasEnMes,
          itemBuilder: (_, i) {
            if (i < offset) return const SizedBox();
            final dia = DateTime(año, mes, i - offset + 1);
            final fechaStr = DateFormat('yyyy-MM-dd').format(dia);
            final esPasado = dia.isBefore(DateTime(hoy.year, hoy.month, hoy.day));
            final esLaboral = _diasLaborales.contains(dia.weekday % 7); // Mon=1→weekday=1; Sun=weekday=7→0
            final bloqueado = _fechasBloqueadas.contains(fechaStr);
            final selec = fechaStr == DateFormat('yyyy-MM-dd').format(_fechaSel);
            final clickeable = !esPasado && esLaboral && !bloqueado;

            if (!clickeable) {
              return Center(child: Text('${dia.day}',
                style: TextStyle(
                  color: bloqueado && !esPasado ? const Color(0xFFE8192C).withOpacity(0.3)
                    : const Color(0xFF1e2d3d),
                  fontSize: 12)));
            }

            return GestureDetector(
              onTap: () {
                setState(() { _fechaSel = dia; });
                _cargarOcupados(dia);
              },
              child: Container(
                decoration: BoxDecoration(
                  color: selec ? const Color(0xFFE8192C).withOpacity(0.2) : Colors.transparent,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: selec ? const Color(0xFFE8192C) : const Color(0xFF1e2d3d)),
                ),
                child: Center(child: Text('${dia.day}',
                  style: TextStyle(
                    color: selec ? const Color(0xFFfb7185) : const Color(0xFFF8F8F8),
                    fontSize: 12, fontWeight: selec ? FontWeight.w700 : FontWeight.normal))),
              ),
            );
          },
        ),
      ]),
    );
  }

  Widget _buildHorarios() {
    final franjas = [
      {'label': '🌅 Mañana', 'slots': _franjaMañana},
      {'label': '🌆 Tarde',  'slots': _franjaTarde},
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: franjas.map((franja) {
        final slots = franja['slots'] as List<String>;
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 6, top: 4),
            child: Text(franja['label'] as String,
              style: const TextStyle(color: Color(0xFF475569), fontSize: 12,
                letterSpacing: 0.8)),
          ),
          GridView.builder(
            shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 5, childAspectRatio: 2.4,
              mainAxisSpacing: 4, crossAxisSpacing: 4),
            itemCount: slots.length,
            itemBuilder: (_, i) {
              final hora = slots[i];
              final ocupado = _ocupados.contains(hora);
              final selec = hora == _horaSel;
              return GestureDetector(
                onTap: ocupado ? null : () => setState(() => _horaSel = hora),
                child: Container(
                  decoration: BoxDecoration(
                    color: selec ? const Color(0xFFE8192C).withOpacity(0.15)
                      : ocupado ? const Color(0xFF060d1a)
                      : const Color(0xFF0d1117),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: selec ? const Color(0xFFE8192C)
                        : ocupado ? const Color(0xFF111827)
                        : const Color(0xFF1e2d3d)),
                  ),
                  child: Center(child: Text(hora,
                    style: TextStyle(
                      color: selec ? const Color(0xFFfb7185)
                        : ocupado ? const Color(0xFF1e2d3d)
                        : const Color(0xFF93c5fd),
                      fontSize: 11, fontWeight: FontWeight.w600))),
                ),
              );
            },
          ),
          const SizedBox(height: 6),
        ]);
      }).toList(),
    );
  }

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(text.toUpperCase(),
      style: const TextStyle(color: Color(0xFF64748b), fontSize: 11, letterSpacing: 1.2)),
  );

  Widget _textField(TextEditingController ctrl, String hint, IconData icon) => TextField(
    controller: ctrl,
    style: const TextStyle(color: Color(0xFFF8F8F8)),
    decoration: InputDecoration(
      hintText: hint, hintStyle: const TextStyle(color: Color(0xFF334155)),
      prefixIcon: Icon(icon, color: const Color(0xFF475569), size: 18),
      filled: true, fillColor: const Color(0xFF0d1117),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFFE8192C))),
    ),
  );
}
