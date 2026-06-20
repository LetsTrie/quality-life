import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../l10n/l10n_extension.dart';
import '../theme/app_spacing.dart';

/// Country dial codes for the phone field. Bangladesh first (the primary
/// market); dial codes are unique so each can be the dropdown's value.
const phoneCountryDialCodes = <Map<String, String>>[
  {'flag': '🇧🇩', 'name': 'Bangladesh', 'dial': '+880'},
  {'flag': '🇮🇳', 'name': 'India', 'dial': '+91'},
  {'flag': '🇵🇰', 'name': 'Pakistan', 'dial': '+92'},
  {'flag': '🇳🇵', 'name': 'Nepal', 'dial': '+977'},
  {'flag': '🇧🇹', 'name': 'Bhutan', 'dial': '+975'},
  {'flag': '🇱🇰', 'name': 'Sri Lanka', 'dial': '+94'},
  {'flag': '🇲🇾', 'name': 'Malaysia', 'dial': '+60'},
  {'flag': '🇸🇬', 'name': 'Singapore', 'dial': '+65'},
  {'flag': '🇦🇪', 'name': 'UAE', 'dial': '+971'},
  {'flag': '🇸🇦', 'name': 'Saudi Arabia', 'dial': '+966'},
  {'flag': '🇶🇦', 'name': 'Qatar', 'dial': '+974'},
  {'flag': '🇰🇼', 'name': 'Kuwait', 'dial': '+965'},
  {'flag': '🇬🇧', 'name': 'United Kingdom', 'dial': '+44'},
  {'flag': '🇺🇸', 'name': 'USA / Canada', 'dial': '+1'},
  {'flag': '🇦🇺', 'name': 'Australia', 'dial': '+61'},
];

const phoneDefaultDialCode = '+880';

/// Holds a phone's selected country dial code + the national number, and
/// composes/splits the stored E.164-ish value. The owning State creates one,
/// seeds it on load, reads [compose] on submit, and disposes it.
class PhoneFieldController {
  PhoneFieldController({this.dialCode = phoneDefaultDialCode, String number = ''})
      : number = TextEditingController(text: number);

  String dialCode;
  final TextEditingController number;

  /// Seed from a stored value (e.g. "+8801712345678"). Falls back to the
  /// default country + raw digits if no known dial code prefixes the value.
  void seed(String? raw) {
    final trimmed = (raw ?? '').trim();
    if (trimmed.isEmpty) return;
    // Longest dial code first so "+1" doesn't shadow longer codes.
    final dials = phoneCountryDialCodes.map((c) => c['dial']!).toList()
      ..sort((a, b) => b.length.compareTo(a.length));
    for (final d in dials) {
      if (trimmed.startsWith(d)) {
        dialCode = d;
        number.text = trimmed.substring(d.length);
        return;
      }
    }
    number.text = trimmed.replaceAll(RegExp(r'\D'), '');
  }

  /// National significant number: digits only, leading trunk 0 dropped
  /// (BD users type 01XXXXXXXXX; E.164 omits the 0).
  String nationalNumber() {
    final digits = number.text.replaceAll(RegExp(r'\D'), '');
    return digits.startsWith('0') ? digits.substring(1) : digits;
  }

  bool get isEmpty => nationalNumber().isEmpty;

  /// Full value to persist, or null when empty (for optional fields).
  String? compose() => isEmpty ? null : '$dialCode${nationalNumber()}';

  void dispose() => number.dispose();
}

/// A country-code dropdown + digits-only national number. There is no
/// free-typed phone string: letters can't be entered, and the accepted format
/// is shown (hint) and enforced (validator) per the selected country.
class PhoneField extends StatefulWidget {
  const PhoneField({
    required this.controller,
    required this.label,
    this.isRequired = false,
    this.enabled = true,
    super.key,
  });

  final PhoneFieldController controller;
  final String label;

  /// When true, an empty number is a validation error.
  final bool isRequired;
  final bool enabled;

  @override
  State<PhoneField> createState() => _PhoneFieldState();
}

class _PhoneFieldState extends State<PhoneField> {
  String? _validate(String? _) {
    final l = context.l10n;
    final national = widget.controller.nationalNumber();
    if (national.isEmpty) return widget.isRequired ? l.requiredField : null;
    if (widget.controller.dialCode == '+880') {
      // BD mobile: 10 digits — 1 followed by operator digit 3–9 (013–019).
      if (!RegExp(r'^1[3-9]\d{8}$').hasMatch(national)) return l.phoneInvalidBd;
    } else if (national.length < 6 || national.length > 14) {
      return l.phoneInvalid;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 132,
          child: DropdownMenu<String>(
            initialSelection: widget.controller.dialCode,
            label: Text(l.fieldCountryCode),
            enabled: widget.enabled,
            expandedInsets: EdgeInsets.zero,
            onSelected: (v) =>
                setState(() => widget.controller.dialCode = v ?? phoneDefaultDialCode),
            dropdownMenuEntries: phoneCountryDialCodes
                .map((c) => DropdownMenuEntry(
                      value: c['dial']!,
                      label: '${c['flag']} ${c['dial']}',
                      labelWidget:
                          Text('${c['flag']} ${c['name']} (${c['dial']})'),
                    ))
                .toList(),
          ),
        ),
        const Gap.horizontal(AppSpacing.sm),
        Expanded(
          child: TextFormField(
            controller: widget.controller.number,
            enabled: widget.enabled,
            keyboardType: TextInputType.phone,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: InputDecoration(
              labelText: widget.label,
              hintText:
                  widget.controller.dialCode == '+880' ? l.phoneHintBd : null,
            ),
            validator: _validate,
          ),
        ),
      ],
    );
  }
}
