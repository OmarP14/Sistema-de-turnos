import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/turno.dart';
import '../services/api_service.dart';

class TurnoCard extends StatefulWidget {
  final Turno turno;
  final VoidCallback onActualizar;

  const TurnoCard({super.key, required this.turno, required this.onActualizar});

  @override
  State<TurnoCard> createState() => _TurnoCardState();
}

class _TurnoCardState extends State<TurnoCard> {
  bool _cargando = false;

  Future<void> _accion(Future<void> Function() fn) async {
    setState(() => _cargando = true);
    try {
      await fn();
      widget.onActualizar();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red[800]),
        );
      }
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Color get _estadoColor {
    switch (widget.turno.estado) {
      case 'CONFIRMADO':  return const Color(0xFF22c55e);
      case 'COMPLETADO':  return const Color(0xFF3b82f6);
      case 'CANCELADO':   return const Color(0xFF64748b);
      default:            return const Color(0xFFf59e0b);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.turno;
    final hora = DateFormat('HH:mm').format(t.fechaHora);
    final fecha = DateFormat("EEE d MMM", 'es').format(t.fechaHora);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0d1117),
        border: Border(left: BorderSide(color: _estadoColor, width: 3)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fila superior: nombre + estado
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(t.clienteNombre,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFFF8F8F8),
                  )),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _estadoColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: _estadoColor.withOpacity(0.4)),
                  ),
                  child: Text(t.estado,
                    style: TextStyle(color: _estadoColor, fontSize: 10,
                      fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            // Fecha, hora, servicio
            Row(children: [
              const Icon(Icons.schedule, size: 13, color: Color(0xFF64748b)),
              const SizedBox(width: 4),
              Text('$fecha  •  $hora',
                style: const TextStyle(color: Color(0xFF64748b), fontSize: 12)),
              const SizedBox(width: 12),
              const Icon(Icons.content_cut, size: 13, color: Color(0xFF64748b)),
              const SizedBox(width: 4),
              Text(t.servicio ?? '', style: const TextStyle(color: Color(0xFF64748b), fontSize: 12)),
            ]),
            if (t.notas != null && t.notas!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(t.notas!, style: const TextStyle(color: Color(0xFF475569), fontSize: 11)),
            ],
            // Teléfono
            const SizedBox(height: 4),
            Row(children: [
              const Icon(Icons.phone, size: 13, color: Color(0xFF475569)),
              const SizedBox(width: 4),
              Text(t.clienteTelefono, style: const TextStyle(color: Color(0xFF475569), fontSize: 11)),
            ]),
            // Botones de acción
            if (!t.esCompletado && !t.esCancelado) ...[
              const SizedBox(height: 12),
              _cargando
                ? const Center(child: SizedBox(width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFE8192C))))
                : Row(children: [
                    if (t.esPendiente) ...[
                      _btn('CONFIRMAR', const Color(0xFF22c55e),
                        () => _accion(() => ApiService.confirmar(t.id))),
                      const SizedBox(width: 8),
                    ],
                    if (t.esConfirmado)
                      _btn('COMPLETAR', const Color(0xFF3b82f6),
                        () => _accion(() => ApiService.completar(t.id))),
                    const Spacer(),
                    _btn('CANCELAR', const Color(0xFF64748b),
                      () => _accion(() => ApiService.cancelar(t.id))),
                  ]),
            ],
          ],
        ),
      ),
    );
  }

  Widget _btn(String label, Color color, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        border: Border.all(color: color.withOpacity(0.6)),
        borderRadius: BorderRadius.circular(4),
        color: color.withOpacity(0.1),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 11,
        fontWeight: FontWeight.w700, letterSpacing: 0.8)),
    ),
  );
}
