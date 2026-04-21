import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/turno.dart';
import '../services/api_service.dart';
import '../widgets/turno_card.dart';

class AgendaScreen extends StatefulWidget {
  const AgendaScreen({super.key});
  @override
  State<AgendaScreen> createState() => _AgendaScreenState();
}

class _AgendaScreenState extends State<AgendaScreen> {
  DateTime _diaSeleccionado = DateTime.now();
  List<Turno> _turnos = [];
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() => _cargando = true);
    try {
      final turnos = await ApiService.getDia(_diaSeleccionado);
      setState(() => _turnos = turnos);
    } catch (e) {
      if (e is UnauthorizedException && mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  void _cambiarDia(int delta) {
    setState(() => _diaSeleccionado = _diaSeleccionado.add(Duration(days: delta)));
    _cargar();
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat("EEEE d 'de' MMMM", 'es');
    final esHoy = _esHoy(_diaSeleccionado);

    return Scaffold(
      backgroundColor: const Color(0xFF060d1a),
      body: RefreshIndicator(
        onRefresh: _cargar,
        color: const Color(0xFFE8192C),
        child: CustomScrollView(slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('AGENDA',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900,
                    letterSpacing: 2, color: Color(0xFFF8F8F8))),
                const SizedBox(height: 14),
                // Navegación de días
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0d1117),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF1e2d3d)),
                  ),
                  child: Row(children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left, color: Color(0xFF64748b)),
                      onPressed: () => _cambiarDia(-1),
                    ),
                    Expanded(
                      child: Column(children: [
                        if (esHoy)
                          const Text('HOY', style: TextStyle(color: Color(0xFFE8192C),
                            fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.w700)),
                        Text(
                          fmt.format(_diaSeleccionado),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: esHoy ? const Color(0xFFF8F8F8) : const Color(0xFF93c5fd),
                            fontSize: 14, fontWeight: FontWeight.w600,
                            letterSpacing: 0.5),
                        ),
                      ]),
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right, color: Color(0xFF64748b)),
                      onPressed: () => _cambiarDia(1),
                    ),
                  ]),
                ),
                const SizedBox(height: 14),
              ]),
            ),
          ),

          if (_cargando)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator(color: Color(0xFFE8192C))))
          else if (_turnos.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.event_available, color: Color(0xFF1e2d3d), size: 48),
                  const SizedBox(height: 12),
                  const Text('Sin turnos este día',
                    style: TextStyle(color: Color(0xFF334155), fontSize: 14)),
                ]),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (_, i) => TurnoCard(turno: _turnos[i], onActualizar: _cargar),
                  childCount: _turnos.length,
                ),
              ),
            ),
        ]),
      ),
    );
  }

  bool _esHoy(DateTime d) {
    final hoy = DateTime.now();
    return d.year == hoy.year && d.month == hoy.month && d.day == hoy.day;
  }
}
