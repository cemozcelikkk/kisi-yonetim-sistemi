import 'package:flutter/material.dart';

import '../models/person.dart';
import '../services/person_service.dart';
import '../theme/app_theme.dart';
import '../utils/format.dart';
import '../utils/validators.dart';
import '../widgets/overline.dart';

// EKRAN 3 — Kişi Ekleme / Düzenleme
// person verilirse düzenleme modu → PUT, verilmezse ekleme modu → POST.
class PersonFormScreen extends StatefulWidget {
  final Person? person;

  const PersonFormScreen({super.key, this.person});

  @override
  State<PersonFormScreen> createState() => _PersonFormScreenState();
}

class _PersonFormScreenState extends State<PersonFormScreen> {
  // Form'daki tüm alanları tek seferde doğrulamak için
  final _formKey = GlobalKey<FormState>();

  // Her metin kutusunun içeriğini tutan controller'lar
  final _fullName = TextEditingController();
  final _department = TextEditingController();
  final _photoUrl = TextEditingController();
  final _birthPlace = TextEditingController();
  final _birthDateText = TextEditingController(); // Sadece seçilen tarihi göstermek için
  final _email = TextEditingController();
  final _phone = TextEditingController();

  DateTime? _birthDate;
  bool _saving = false;

  bool get _isEdit => widget.person != null;

  @override
  void initState() {
    super.initState();
    // Düzenleme modunda mevcut bilgileri forma doldur
    final person = widget.person;
    if (person != null) {
      _fullName.text = person.fullName;
      _department.text = person.department;
      _photoUrl.text = person.photoUrl ?? '';
      _birthPlace.text = person.birthPlace;
      _setBirthDate(person.birthDate);
      _email.text = person.email;
      _phone.text = person.phone;
    }
  }

  // Controller'lar bellekte yer tutar; ekran kapanınca serbest bırakılır.
  @override
  void dispose() {
    for (final controller in [_fullName, _department, _photoUrl, _birthPlace, _birthDateText, _email, _phone]) {
      controller.dispose();
    }
    super.dispose();
  }

  void _setBirthDate(DateTime date) {
    _birthDate = date;
    _birthDateText.text = formatDisplayDate(date);
  }

  Future<void> _pickBirthDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime(1995),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(), // Doğum tarihi gelecekte olamaz
    );
    if (picked != null) {
      setState(() => _setBirthDate(picked));
    }
  }

  Future<void> _save() async {
    // 1) İstemci tarafı doğrulama: her alanın validator'ı çalışır
    if (!_formKey.currentState!.validate()) return;

    // 2) Form değerlerinden API'ye gönderilecek nesneyi oluştur
    final photoUrl = _photoUrl.text.trim();
    final person = Person(
      id: widget.person?.id ?? 0,
      fullName: _fullName.text.trim(),
      department: _department.text.trim(),
      photoUrl: photoUrl.isEmpty ? null : photoUrl,
      birthPlace: _birthPlace.text.trim(),
      birthDate: _birthDate!,
      email: _email.text.trim(),
      phone: _phone.text.trim(),
    );

    // 3) İsteği gönder: düzenlemede PUT, eklemede POST
    setState(() => _saving = true);
    try {
      if (_isEdit) {
        await PersonService.updatePerson(person);
      } else {
        await PersonService.createPerson(person);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(_isEdit ? 'Değişiklikler kaydedildi.' : '${person.fullName} eklendi.')));
      Navigator.pop(context); // Önceki ekrana dön; o ekran kendini yeniler
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final id = widget.person?.id.toString().padLeft(2, '0');

    return Scaffold(
      appBar: AppBar(),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
          children: [
            // Başlık: düzenlemede kayıt numarası, eklemede "Yeni kayıt"
            Align(alignment: Alignment.centerLeft, child: Overline(_isEdit ? 'Kayıt no. $id' : 'Yeni kayıt')),
            const SizedBox(height: 14),
            Text(_isEdit ? 'Kişiyi düzenle' : 'Yeni kişi', style: AppText.title),
            const SizedBox(height: 32),
            TextFormField(
              controller: _fullName,
              decoration: const InputDecoration(labelText: 'Ad soyad *'),
              textCapitalization: TextCapitalization.words,
              validator: validateFullName,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _department,
              decoration: const InputDecoration(labelText: 'Departman *'),
              validator: (value) => validateRequired(value, 'Departman zorunludur.'),
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _photoUrl,
              decoration: const InputDecoration(
                labelText: 'Fotoğraf adresi',
                helperText: 'İsteğe bağlı. Boş bırakılırsa baş harfler gösterilir.',
              ),
              keyboardType: TextInputType.url,
              validator: validatePhotoUrl,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _birthPlace,
              decoration: const InputDecoration(labelText: 'Doğum yeri *'),
              textCapitalization: TextCapitalization.words,
              validator: (value) => validateRequired(value, 'Doğum yeri zorunludur.'),
            ),
            const SizedBox(height: 20),
            // Klavye yerine tarih seçici açılır
            TextFormField(
              controller: _birthDateText,
              readOnly: true,
              onTap: _pickBirthDate,
              decoration: const InputDecoration(
                labelText: 'Doğum tarihi *',
                suffixIcon: Icon(Icons.calendar_today_outlined, size: 20, color: AppColors.aubergine),
              ),
              validator: (_) => _birthDate == null ? 'Doğum tarihi seçiniz.' : null,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _email,
              decoration: const InputDecoration(labelText: 'E-posta *'),
              keyboardType: TextInputType.emailAddress,
              validator: validateEmail,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _phone,
              decoration: const InputDecoration(labelText: 'Telefon *', hintText: '+905550123456'),
              keyboardType: TextInputType.phone,
              validator: validatePhone,
            ),
            const SizedBox(height: 40),
            FilledButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.silverLight),
                    )
                  : const Icon(Icons.check, size: 20, color: AppColors.marigold),
              label: Text(_isEdit ? 'Değişiklikleri kaydet' : 'Kişiyi kaydet'),
            ),
          ],
        ),
      ),
    );
  }
}
