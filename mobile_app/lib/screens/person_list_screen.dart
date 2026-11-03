import 'package:flutter/material.dart';

import '../models/person.dart';
import '../services/person_service.dart';
import '../theme/app_theme.dart';
import '../widgets/error_view.dart';
import '../widgets/overline.dart';
import '../widgets/person_row.dart';
import 'person_detail_screen.dart';
import 'person_form_screen.dart';

// EKRAN 1 — Kişi Listesi (GET /api/persons)
class PersonListScreen extends StatefulWidget {
  const PersonListScreen({super.key});

  @override
  State<PersonListScreen> createState() => _PersonListScreenState();
}

class _PersonListScreenState extends State<PersonListScreen> {
  // API isteğinin sonucu. FutureBuilder bu Future'ı dinleyip ekranı çizer.
  late Future<List<Person>> _personsFuture;

  @override
  void initState() {
    super.initState();
    _personsFuture = PersonService.getPersons();
  }

  // Yeni bir istek başlatır; setState ekranı yeniden çizdirir.
  void _reload() {
    setState(() {
      _personsFuture = PersonService.getPersons();
    });
  }

  // Aşağı çekip yenileme: istek bitene kadar dönen gösterge kalır.
  Future<void> _refresh() async {
    _reload();
    try {
      await _personsFuture;
    } catch (_) {
      // Hata mesajını FutureBuilder gösterir
    }
  }

  // Detaydan dönünce (düzenleme veya silme olmuş olabilir) liste yeniden çekilir.
  Future<void> _openDetail(Person person) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => PersonDetailScreen(personId: person.id)));
    if (mounted) _reload();
  }

  Future<void> _openForm() async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const PersonFormScreen()));
    if (mounted) _reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: FutureBuilder<List<Person>>(
          future: _personsFuture,
          builder: (context, snapshot) {
            // Veri varsa göster (yenilenirken eski liste ekranda kalır)
            if (snapshot.hasData) {
              return _buildList(snapshot.data!);
            }
            // İstek sürüyorsa yükleniyor göstergesi
            if (snapshot.connectionState != ConnectionState.done) {
              return const Column(
                children: [
                  _Header(subtitle: 'Yükleniyor…'),
                  Expanded(child: Center(child: CircularProgressIndicator())),
                ],
              );
            }
            // İstek bitti ama veri yok: hata oluştu
            return Column(
              children: [
                const _Header(subtitle: 'Sunucuya bağlanılamadı'),
                Expanded(
                  child: ErrorView(message: '${snapshot.error}', onRetry: _reload),
                ),
              ],
            );
          },
        ),
      ),
      // Sağ altta sabit duran "yeni kişi" butonu
      floatingActionButton: FloatingActionButton(
        onPressed: _openForm,
        tooltip: 'Yeni kişi ekle',
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }

  Widget _buildList(List<Person> persons) {
    return RefreshIndicator(
      onRefresh: _refresh,
      // Kaydırılabilir liste. İlk eleman başlık, sonrakiler kişi satırları.
      child: ListView.builder(
        padding: const EdgeInsets.only(bottom: 120), // Son satır FAB'ın altında kalmasın
        itemCount: persons.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return _Header(
              subtitle: persons.isEmpty
                  ? 'Rehber boş. Sağ alttaki + ile ilk kişiyi ekleyin.'
                  : '${persons.length} kişi kayıtlı · ada göre sıralı',
            );
          }
          final person = persons[index - 1];
          return PersonRow(person: person, onTap: () => _openDetail(person));
        },
      ),
    );
  }
}

// Ekranın üst kısmı: "REHBER" etiketi, büyük "Kişiler" başlığı ve kayıt sayısı.
class _Header extends StatelessWidget {
  final String subtitle;

  const _Header({required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 28),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.hairline)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Overline('Rehber'),
          const SizedBox(height: 16),
          const Text('Kişiler', style: AppText.hero),
          const SizedBox(height: 10),
          Text(subtitle, style: AppText.secondary),
        ],
      ),
    );
  }
}
