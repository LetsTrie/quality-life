import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../geo/data/geo_repository.dart';
import '../data/users_repository.dart';

class UserProfileCompletionScreen extends ConsumerStatefulWidget {
  const UserProfileCompletionScreen({super.key});

  @override
  ConsumerState<UserProfileCompletionScreen> createState() => _UserProfileCompletionScreenState();
}

class _UserProfileCompletionScreenState extends ConsumerState<UserProfileCompletionScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  String? _gender;
  String? _marital;

  String? _districtId;
  String? _upazilaId;
  String? _unionId;

  bool _loading = true;
  bool _saving = false;
  String? _error;

  List<Map<String, dynamic>> _districts = const [];
  List<Map<String, dynamic>> _upazilas = const [];
  List<Map<String, dynamic>> _unions = const [];

  @override
  void initState() {
    super.initState();
    Future<void>(() async {
      await _loadInitial();
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _ageCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final users = ref.read(usersRepositoryProvider);
      final geo = ref.read(geoRepositoryProvider);

      final me = await users.me();
      final data = me['data'] as Map<String, dynamic>;
      final user = data['user'] as Map<String, dynamic>;

      _nameCtrl.text = (user['displayName']?.toString() ?? '').trim();
      _phoneCtrl.text = (user['phone']?.toString() ?? '').trim();

      final dob = user['dateOfBirth']?.toString();
      if (dob != null && dob.length >= 4) {
        final year = int.tryParse(dob.substring(0, 4));
        if (year != null) {
          final nowYear = DateTime.now().year;
          final age = nowYear - year;
          if (age >= 0) _ageCtrl.text = age.toString();
        }
      }

      _gender = user['gender']?.toString();
      _marital = user['marital']?.toString();

      _districtId = user['districtId']?.toString();
      _upazilaId = user['upazilaId']?.toString();
      _unionId = user['unionId']?.toString();

      _districts = await geo.listDistricts();
      if (_districtId != null) {
        _upazilas = await geo.listUpazilas(_districtId!);
      }
      if (_upazilaId != null) {
        _unions = await geo.listUnions(_upazilaId!);
      }
    } catch (e) {
      setState(() => _error = 'Could not load profile. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _onDistrictChanged(String? id) async {
    setState(() {
      _districtId = id;
      _upazilaId = null;
      _unionId = null;
      _upazilas = const [];
      _unions = const [];
    });
    if (id == null) return;
    try {
      final geo = ref.read(geoRepositoryProvider);
      final list = await geo.listUpazilas(id);
      if (mounted) setState(() => _upazilas = list);
    } catch (_) {}
  }

  Future<void> _onUpazilaChanged(String? id) async {
    setState(() {
      _upazilaId = id;
      _unionId = null;
      _unions = const [];
    });
    if (id == null) return;
    try {
      final geo = ref.read(geoRepositoryProvider);
      final list = await geo.listUnions(id);
      if (mounted) setState(() => _unions = list);
    } catch (_) {}
  }

  Future<void> _save() async {
    setState(() {
      _error = null;
      _saving = true;
    });
    try {
      final ok = _formKey.currentState?.validate() ?? false;
      if (!ok) return;

      final users = ref.read(usersRepositoryProvider);
      await users.updateMe(
        displayName: _nameCtrl.text.trim(),
        ageYears: _ageCtrl.text.trim(),
        gender: _gender!,
        marital: _marital!,
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        districtId: _districtId,
        upazilaId: _upazilaId,
        unionId: _unionId,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile saved')),
      );
      context.go(const HomeRoute().location);
    } catch (e) {
      setState(() => _error = 'Failed to save profile. Please try again.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete profile'),
        actions: [
          IconButton(
            onPressed: _saving ? null : _loadInitial,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                if (_error != null) ...[
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  const SizedBox(height: 12),
                ],
                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(labelText: 'Name'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Name required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _ageCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Age (years)'),
                  validator: (v) {
                    final s = v?.trim() ?? '';
                    final n = int.tryParse(s);
                    if (n == null) return 'Valid age required';
                    if (n < 5 || n > 150) return 'Age must be 5–150';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                DropdownMenu<String>(
                  initialSelection: _gender,
                  label: const Text('Gender'),
                  enabled: !_saving,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => setState(() => _gender = v),
                  dropdownMenuEntries: const [
                    DropdownMenuEntry(value: 'MALE', label: 'Male'),
                    DropdownMenuEntry(value: 'FEMALE', label: 'Female'),
                    DropdownMenuEntry(value: 'OTHER', label: 'Other'),
                    DropdownMenuEntry(value: 'UNDISCLOSED', label: 'Prefer not to say'),
                  ],
                ),
                const SizedBox(height: 12),
                DropdownMenu<String>(
                  initialSelection: _marital,
                  label: const Text('Marital status'),
                  enabled: !_saving,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => setState(() => _marital = v),
                  dropdownMenuEntries: const [
                    DropdownMenuEntry(value: 'SINGLE', label: 'Single'),
                    DropdownMenuEntry(value: 'MARRIED', label: 'Married'),
                    DropdownMenuEntry(value: 'DIVORCED', label: 'Divorced'),
                    DropdownMenuEntry(value: 'WIDOWED', label: 'Widowed'),
                    DropdownMenuEntry(value: 'SEPARATED', label: 'Separated'),
                    DropdownMenuEntry(value: 'UNDISCLOSED', label: 'Prefer not to say'),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _phoneCtrl,
                  decoration: const InputDecoration(labelText: 'Phone (optional)'),
                ),
                const SizedBox(height: 12),
                DropdownMenu<String>(
                  initialSelection: _districtId,
                  label: const Text('District'),
                  enabled: !_saving,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => _onDistrictChanged(v),
                  dropdownMenuEntries: _districts
                      .map((d) => DropdownMenuEntry(
                            value: d['id'] as String,
                            label: d['nameBn'] as String? ?? '',
                          ))
                      .toList(),
                ),
                const SizedBox(height: 12),
                DropdownMenu<String>(
                  initialSelection: _upazilaId,
                  label: const Text('Upazila (optional)'),
                  enabled: !_saving && _upazilas.isNotEmpty,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => _onUpazilaChanged(v),
                  dropdownMenuEntries: _upazilas
                      .map((u) => DropdownMenuEntry(
                            value: u['id'] as String,
                            label: u['nameBn'] as String? ?? '',
                          ))
                      .toList(),
                ),
                const SizedBox(height: 12),
                DropdownMenu<String>(
                  initialSelection: _unionId,
                  label: const Text('Union (optional)'),
                  enabled: !_saving && _unions.isNotEmpty,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => setState(() => _unionId = v),
                  dropdownMenuEntries: _unions
                      .map((u) => DropdownMenuEntry(
                            value: u['id'] as String,
                            label: u['nameBn'] as String? ?? '',
                          ))
                      .toList(),
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: Text(_saving ? 'Saving...' : 'Save & continue'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
