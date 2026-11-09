# flutter gotchas
- [gotcha] `flutter test --update-goldens` regenerates every golden it touches; run it on the platform CI uses or goldens fail on CI from font rendering alone · paths: test/**
- [gotcha] Values passed with --dart-define are compile-time constants embedded in the binary; obfuscation does not hide them · paths: lib/**
