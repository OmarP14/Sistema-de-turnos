import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _userCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String _error = '';
  bool _verPass = false;

  Future<void> _login() async {
    setState(() { _loading = true; _error = ''; });
    try {
      await ApiService.login(_userCtrl.text.trim(), _passCtrl.text.trim());
      if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
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
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Container(
                  width: 72, height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFE8192C), Color(0xFFb91c2c)],
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: const Color(0xFFE8192C).withOpacity(0.4),
                      blurRadius: 20, spreadRadius: 2)],
                  ),
                  child: const Icon(Icons.content_cut, color: Colors.white, size: 36),
                ),
                const SizedBox(height: 20),
                const Text('BARBERAPP',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900,
                    letterSpacing: 4, color: Color(0xFFF8F8F8))),
                const SizedBox(height: 6),
                const Text('PANEL DEL BARBERO',
                  style: TextStyle(fontSize: 11, letterSpacing: 3,
                    color: Color(0xFF475569))),
                const SizedBox(height: 40),

                // Campo usuario
                _campo(
                  controller: _userCtrl,
                  label: 'Usuario',
                  icono: Icons.person_outline,
                ),
                const SizedBox(height: 14),

                // Campo contraseña
                _campo(
                  controller: _passCtrl,
                  label: 'Contraseña',
                  icono: Icons.lock_outline,
                  obscure: !_verPass,
                  sufijo: IconButton(
                    icon: Icon(_verPass ? Icons.visibility_off : Icons.visibility,
                      color: const Color(0xFF475569), size: 18),
                    onPressed: () => setState(() => _verPass = !_verPass),
                  ),
                  onSubmit: _login,
                ),
                const SizedBox(height: 8),

                if (_error.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8192C).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFE8192C).withOpacity(0.3)),
                    ),
                    child: Text(_error, style: const TextStyle(color: Color(0xFFfb7185), fontSize: 13)),
                  ),

                // Botón login
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _login,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE8192C),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    child: _loading
                      ? const SizedBox(width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('INGRESAR',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                            letterSpacing: 2, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _campo({
    required TextEditingController controller,
    required String label,
    required IconData icono,
    bool obscure = false,
    Widget? sufijo,
    VoidCallback? onSubmit,
  }) => TextField(
    controller: controller,
    obscureText: obscure,
    onSubmitted: (_) => onSubmit?.call(),
    style: const TextStyle(color: Color(0xFFF8F8F8)),
    decoration: InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Color(0xFF475569), fontSize: 13),
      prefixIcon: Icon(icono, color: const Color(0xFF475569), size: 18),
      suffixIcon: sufijo,
      filled: true,
      fillColor: const Color(0xFF0d1117),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF1a1a2e))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF1e2d3d))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFFE8192C))),
    ),
  );
}
