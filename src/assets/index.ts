/*
 * Illustrations exported from the GroundCheck Figma file.
 * Light files are the original exports; dark files use the dark-mode palette from the dark frames.
 */
import bottomWavesLight from './light/bottom_waves.svg';
import bottomWavesDark from './dark/bottom_waves.svg';
import cardCloudLight from './light/card_cloud.svg';
import cardCloudDark from './dark/card_cloud.svg';
import cardSunLight from './light/card_sun.svg';
import cardSunDark from './dark/card_sun.svg';
import cautionSceneLight from './light/caution_scene.svg';
import cautionSceneDark from './dark/caution_scene.svg';
import cloudLight from './light/cloud.svg';
import cloudDark from './dark/cloud.svg';
import cloudBLight from './light/cloud_b.svg';
import cloudBDark from './dark/cloud_b.svg';
import cloudCLight from './light/cloud_c.svg';
import cloudCDark from './dark/cloud_c.svg';
import headerWaveLight from './light/header_wave.svg';
import headerWaveDark from './dark/header_wave.svg';
import headerWaveDesktopLight from './light/header_wave_desktop.svg';
import headerWaveDesktopDark from './dark/header_wave_desktop.svg';
import logoLight from './light/logo_circles.svg';
import logoDark from './dark/logo_circles.svg';
import mountainsLight from './light/mountains.svg';
import mountainsDark from './dark/mountains.svg';
import sunLight from './light/sun.svg';
import sunDark from './dark/sun.svg';
import titleGlow from './light/title_glow.svg';
import welcomeTopLight from './light/welcome_top.svg';
import welcomeTopDark from './dark/welcome_top.svg';
import windmillLight from './light/windmill.svg';
import windmillDark from './dark/windmill.svg';
import windmillAltLight from './light/windmill_alt.svg';
import windmillAltDark from './dark/windmill_alt.svg';

export interface ThemedAsset {
  light: string;
  dark: string;
}

export const ASSETS = {
  bottomWaves: { light: bottomWavesLight, dark: bottomWavesDark },
  cardCloud: { light: cardCloudLight, dark: cardCloudDark },
  cardSun: { light: cardSunLight, dark: cardSunDark },
  cautionScene: { light: cautionSceneLight, dark: cautionSceneDark },
  cloud: { light: cloudLight, dark: cloudDark },
  cloudB: { light: cloudBLight, dark: cloudBDark },
  cloudC: { light: cloudCLight, dark: cloudCDark },
  headerWave: { light: headerWaveLight, dark: headerWaveDark },
  headerWaveDesktop: { light: headerWaveDesktopLight, dark: headerWaveDesktopDark },
  logo: { light: logoLight, dark: logoDark },
  mountains: { light: mountainsLight, dark: mountainsDark },
  sun: { light: sunLight, dark: sunDark },
  titleGlow: { light: titleGlow, dark: titleGlow },
  welcomeTop: { light: welcomeTopLight, dark: welcomeTopDark },
  windmill: { light: windmillLight, dark: windmillDark },
  windmillAlt: { light: windmillAltLight, dark: windmillAltDark },
} satisfies Record<string, ThemedAsset>;

export type AssetName = keyof typeof ASSETS;

/**
 * Figma exports include room for drop shadows around each shape.
 * These are the extra margins (top, right, bottom, left) as fractions of the layer size,
 * taken from the Figma design context, so a layer can be placed using its Figma box.
 */
export const EXPORT_PADDING: Partial<Record<AssetName, [number, number, number, number]>> = {
  sun: [0.0152, 0.0303, 0.0455, 0.0303],
  cardSun: [0.0258, 0.0516, 0.0774, 0.0516],
  cloud: [0.0359, 0.0386, 0.0838, 0.0386],
  cloudB: [0.0359, 0.0386, 0.0838, 0.0386],
  cloudC: [0.0359, 0.0386, 0.0838, 0.0386],
  cardCloud: [0.0359, 0.0386, 0.0838, 0.0386],
  mountains: [0, 0.0137, 0.0651, 0.0137],
  bottomWaves: [0.0145, 0.0069, 0.0036, 0.0069],
  welcomeTop: [0.0086, 0.0143, 0.02, 0.0143],
  headerWave: [0.0313, 0.0143, 0.0729, 0.0143],
  headerWaveDesktop: [0.011, 0.0049, 0.0256, 0.0049],
  windmill: [0.0636, 0.0656, 0.0636, 0.0656],
  windmillAlt: [0.0636, 0.0656, 0.0636, 0.0656],
};
