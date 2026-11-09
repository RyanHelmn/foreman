# expo gotchas
- [gotcha] An EAS Update published against a runtimeVersion whose builds lack a newly added native module crashes those apps on launch; check the runtime version before `eas update` · paths: app.json
- [gotcha] Values read in app.config.ts into `extra` are embedded in the app and readable via expo-constants, just like EXPO_PUBLIC_* · paths: app.config.*
- [gotcha] EXPO_PUBLIC_* variables are inlined at bundle time only when accessed as `process.env.EXPO_PUBLIC_X`; destructuring or dynamic access yields undefined · paths: **/*.ts*
- [gotcha] Editing ios/ or android/ in a prebuild-managed project is overwritten by `npx expo prebuild --clean`; make the change in app config or a config plugin · paths: ios/**
