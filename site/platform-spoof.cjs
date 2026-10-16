// Node reports process.platform === 'android' because Termux runs on Android,
// but the userland is Ubuntu 24.04 under PRoot with glibc 2.39 and a Linux
// arm64 kernel. Playwright gates on process.platform only, so relabelling it
// lets it resolve and install its normal Linux build.
Object.defineProperty(process, "platform", { value: "linux" });
