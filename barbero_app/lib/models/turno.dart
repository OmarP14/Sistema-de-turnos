class Turno {
  final int id;
  final String clienteNombre;
  final String clienteTelefono;
  final DateTime fechaHora;
  final String? servicio;
  final String estado;
  final String? notas;

  Turno({
    required this.id,
    required this.clienteNombre,
    required this.clienteTelefono,
    required this.fechaHora,
    this.servicio,
    required this.estado,
    this.notas,
  });

  factory Turno.fromJson(Map<String, dynamic> j) => Turno(
        id:               j['id'],
        clienteNombre:    j['clienteNombre'],
        clienteTelefono:  j['clienteTelefono'],
        fechaHora:        DateTime.parse(j['fechaHora']).toLocal(),
        servicio:         j['servicio'],
        estado:           j['estado'],
        notas:            j['notas'],
      );

  bool get esPendiente   => estado == 'PENDIENTE';
  bool get esConfirmado  => estado == 'CONFIRMADO';
  bool get esCompletado  => estado == 'COMPLETADO';
  bool get esCancelado   => estado == 'CANCELADO';
}
