import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/person.dart';
import '../services/person_service.dart';
import '../theme/app_theme.dart';
import '../utils/format.dart';
import '../widgets/error_view.dart';
import '../widgets/info_row.dart';
import '../widgets/overline.dart';
import '../widgets/person_avatar.dart';
import 'person_form_screen.dart';

// EKRAN 2 — Kişi Detayı (GET /api/persons/{id} ve DELETE /api/persons/{id})
class PersonDetailScreen extends StatefulWidget {
  final int personId; // Listeden gelen kişinin id'si

  const PersonDetailScreen({super.key, required this.personId});

  @override
  State<PersonDetailScreen> createState() => _PersonDetailScreenState();
}

class _PersonDetailScreenState extends State<PersonDetailScreen> {
  late Future<Person> _personFuture;
  bool _deleting = false;

  @override
  void initState() {
    super.initState();
    _personFuture = PersonService.getPerson(widget.personId);
  }

  void _reload() {
    setState(() {
      _personFuture = PersonService.getPerson(widget.personId);
    });
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  // mailto: ve tel: adresleri cihazın e-posta ve telefon uygulamalarını açar.
  Future<void> _launch(Uri uri) async {
    bool opened;
    try {
      opened = await launchUrl(uri);
    } catch (_) {
      opened = false;
    }
    if (!opened && mounted) {
      _showMessage('Bu işlem için cihazda uygun uygulama bulunamadı.');
    }
  }

  // Düzenleme ekranından dönünce güncel bilgiler yeniden çekilir.
  Future<void> _edit(Person person) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => PersonFormScreen(person: person)));
    if (mounted) _reload();
  }

  Future<void> _confirmDelete(Person person) async {
    // showDialog kullanıcı bir butona basana kadar bekler; true/false döner.
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Kişi silinsin mi?'),
        content: Text('${person.fullName} kalıcı olarak silinecek. Bu işlem geri alınamaz.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger, minimumSize: const Size(88, 48)),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sil'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _deleting = true);
    try {
      await PersonService.deletePerson(person.id);
      if (!mounted) return;
      Navigator.pop(context); // Listeye dön; liste kendini yeniler
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _deleting = false);
      _showMessage(e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Person>(
      future: _personFuture,
      builder: (context, snapshot) {
        final person = snapshot.data;

        Widget body;
        if (person != null) {
          body = _buildDetails(person);
        } else if (snapshot.connectionState != ConnectionState.done) {
          body = const Center(child: CircularProgressIndicator());
        } else {
          body = ErrorView(message: '${snapshot.error}', onRetry: _reload);
        }

        return Scaffold(
          appBar: AppBar(title: person == null ? null : Overline('Kayıt no. ${person.id.toString().padLeft(2, '0')}')),
          body: body,
          // Butonlar en altta sabit; kişi yüklenmeden gösterilmez
          bottomNavigationBar: person == null ? null : _buildActions(person),
        );
      },
    );
  }

  Widget _buildDetails(Person person) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      children: [
        // Üstte büyük fotoğraf: ince Marigold halka ile çerçevelenir
        Center(
          child: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.marigold, width: 1.5),
            ),
            child: PersonAvatar(photoUrl: person.photoUrl, name: person.fullName, radius: 72),
          ),
        ),
        const SizedBox(height: 28),
        // Ortada ad-soyad ve departman
        Text(person.fullName, style: AppText.title, textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(person.department, style: AppText.italic, textAlign: TextAlign.center),
        const SizedBox(height: 40),
        // Alt panel: bilgi satırları
        _buildSection('Kişisel bilgiler', [
          InfoRow(label: 'Doğum yeri', value: person.birthPlace),
          InfoRow(label: 'Doğum tarihi', value: formatDisplayDate(person.birthDate), showDivider: false),
        ]),
        const SizedBox(height: 28),
        _buildSection('İletişim', [
          InfoRow(
            label: 'E-posta',
            value: person.email,
            actionIcon: Icons.north_east,
            onTap: () => _launch(Uri(scheme: 'mailto', path: person.email)),
          ),
          InfoRow(
            label: 'Telefon',
            value: person.phone,
            actionIcon: Icons.call_outlined,
            onTap: () => _launch(Uri(scheme: 'tel', path: person.phone)),
            showDivider: false,
          ),
        ]),
      ],
    );
  }

  // İtalik başlık ve altında açık renkli, köşeleri yuvarlak bir panel (kart).
  Widget _buildSection(String title, List<Widget> rows) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(title, style: AppText.italic.copyWith(color: AppColors.muted)),
        ),
        // ClipRRect: satırlara dokununca oluşan efekt yuvarlak köşelerden taşmasın
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Material(
            color: AppColors.silverLight,
            child: Column(children: rows),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(Person person) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.silver,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: FilledButton.icon(
                  onPressed: _deleting ? null : () => _edit(person),
                  icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.marigold),
                  label: const Text('Düzenle'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.danger,
                    side: const BorderSide(color: AppColors.danger),
                  ),
                  onPressed: _deleting ? null : () => _confirmDelete(person),
                  icon: const Icon(Icons.delete_outline, size: 18),
                  label: const Text('Sil'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
