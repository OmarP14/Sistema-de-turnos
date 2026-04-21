import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/agenda_screen.dart';
import 'screens/nuevo_turno_screen.dart';
import 'screens/historial_screen.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es', null);
  runApp(const BarberApp());
}

class BarberApp extends StatelessWidget {
  const BarberApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BarberApp',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF060d1a),
        colorScheme: const ColorScheme.dark(primary: Color(0xFFE8192C)),
        fontFamily: 'Roboto',
      ),
      home: const _SplashRouter(),
      routes: {
        '/login':     (_) => const LoginScreen(),
        '/dashboard': (_) => const HomeShell(),
      },
    );
  }
}

// Decide si ir al login o al dashboard según el token guardado
class _SplashRouter extends StatefulWidget {
  const _SplashRouter();
  @override
  State<_SplashRouter> createState() => _SplashRouterState();
}

class _SplashRouterState extends State<_SplashRouter> {
  @override
  void initState() {
    super.initState();
    _redirigir();
  }

  Future<void> _redirigir() async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (!mounted) return;
    final loggedIn = await ApiService.isLoggedIn();
    Navigator.pushReplacementNamed(context, loggedIn ? '/dashboard' : '/login');
  }

  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: CircularProgressIndicator(color: Color(0xFFE8192C))),
  );
}

// Shell con barra de navegación inferior
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _idx = 0;

  final _screens = const [
    DashboardScreen(),
    AgendaScreen(),
    HistorialScreen(),
  ];

  final _navItems = const [
    BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
    BottomNavigationBarItem(icon: Icon(Icons.calendar_month_outlined), activeIcon: Icon(Icons.calendar_month), label: 'Agenda'),
    BottomNavigationBarItem(icon: Icon(Icons.history), label: 'Historial'),
  ];

  Future<void> _cerrarSesion() async {
    await ApiService.logout();
    if (mounted) Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060d1a),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0d1117),
        elevation: 0,
        title: Row(children: [
          Container(
            width: 30, height: 30,
            decoration: BoxDecoration(
              color: const Color(0xFFE8192C),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.content_cut, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 10),
          const Text('BARBERAPP',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900,
              letterSpacing: 2, color: Color(0xFFF8F8F8))),
        ]),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFF64748b)),
            tooltip: 'Cerrar sesión',
            onPressed: _cerrarSesion,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: Container(
            height: 2,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFE8192C), Color(0xFF3b82f6), Color(0xFF060d1a)])),
          ),
        ),
      ),
      body: IndexedStack(index: _idx, children: _screens),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFE8192C),
        onPressed: () async {
          final creado = await Navigator.push<bool>(context,
            MaterialPageRoute(builder: (_) => const NuevoTurnoScreen()));
          if (creado == true) setState(() => _idx = 0);
        },
        child: const Icon(Icons.add, color: Colors.white),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _idx,
        onTap: (i) => setState(() => _idx = i),
        backgroundColor: const Color(0xFF0d1117),
        selectedItemColor: const Color(0xFFfb7185),
        unselectedItemColor: const Color(0xFF475569),
        selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        items: _navItems,
      ),
    );
  }
}
