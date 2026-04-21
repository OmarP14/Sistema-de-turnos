import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/turno.dart';
import '../services/api_service.dart';
import '../widgets/turno_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Turno> _turnos = [];
  bool _cargando = true;
  String _filtro = 'TODOS';

  final _filtros = ['TODOS', 'PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'];

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() => _cargando = true);
    try {
      final todos = await ApiService.getTodos();
      final hoy = DateTime.now();
      final desde = DateTime(hoy.year, hoy.month, hoy.day);
      setState(() {
        _turnos = todos.where((t) => t.fechaHora.isAfter(desde)).toList()
          ..sort((a, b) => a.fechaHora.compareTo(b.fechaHora));
      });
    } catch (e) {
      if (e is UnauthorizedException && mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  List<Turno> get _filtrados =>
      _filtro == 'TODOS' ? _turnos : _turnos.where((t) => t.estado == _filtro).toList();

  @override
  Widget build(BuildContext context) {
    final pendientes = _turnos.where((t) => t.esPendiente).length;

    return Scaffold(
      backgroundColor: const Color(0xFF060d1a),
      body: RefreshIndicator(
        onRefresh: _cargar,
        color: const Color(0xFFE8192C),
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      DateFormat("EEEE d 'de' MMMM", 'es').format(DateTime.now()),
                      style: const TextStyle(color: Color(0xFF475569), fontSize: 12,
                        letterSpacing: 1),
                    ),
                    const SizedBox(height: 4),
                    Row(children: [
                      const Text('PRÓXIMOS TURNOS',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900,
                          letterSpacing: 2, color: Color(0xFFF8F8F8))),
                      if (pendientes > 0) ...[
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8192C),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text('$pendientes pendiente${pendientes > 1 ? 's' : ''}',
                            style: const TextStyle(color: Colors.white, fontSize: 11,
                              fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ]),
                    const SizedBox(height: 14),
                    // Chips de filtro
                    SizedBox(
                      height: 32,
                      child: ListView(scrollDirection: Axis.horizontal, children: _filtros.map((f) {
                        final activo = _filtro == f;
                        return GestureDetector(
                          onTap: () => setState(() => _filtro = f),
                          child: Container(
                            margin: const EdgeInsets.only(right: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: activo ? const Color(0xFFE8192C).withOpacity(0.15) : const Color(0xFF0d1117),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: activo ? const Color(0xFFE8192C).withOpacity(0.5) : const Color(0xFF1e2d3d)),
                            ),
                            child: Text(f,
                              style: TextStyle(
                                color: activo ? const Color(0xFFfb7185) : const Color(0xFF475569),
                                fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                          ),
                        );
                      }).toList()),
                    ),
                    const SizedBox(height: 14),
                  ],
                ),
              ),
            ),

            // Lista
            if (_cargando)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator(color: Color(0xFFE8192C))))
            else if (_filtrados.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Icon(Icons.calendar_today_outlined, color: Color(0xFF1e2d3d), size: 48),
                    const SizedBox(height: 12),
                    Text(
                      _filtro == 'TODOS' ? 'No hay turnos próximos' : 'No hay turnos $_filtro',
                      style: const TextStyle(color: Color(0xFF334155), fontSize: 14)),
                  ]),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => TurnoCard(turno: _filtrados[i], onActualizar: _cargar),
                    childCount: _filtrados.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
