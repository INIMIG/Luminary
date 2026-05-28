import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.165.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const app = document.getElementById("app");
const projectTitleEl = document.getElementById("title");
const introEl = document.getElementById("intro");
const sourceInputEl = document.getElementById("sourceInput");
const sourceStatusEl = document.getElementById("sourceStatus");
const generateBtnEl = document.getElementById("generateBtn");
const loadDefaultBtnEl = document.getElementById("loadDefaultBtn");
const loadSpaceDemoBtnEl = document.getElementById("loadSpaceDemoBtn");
const stageTabsEl = document.getElementById("stageTabs");
const storyTitleEl = document.getElementById("storyTitle");
const storyLeadEl = document.getElementById("storyLead");
const storyBodyEl = document.getElementById("storyBody");
const storyFactsEl = document.getElementById("storyFacts");
const controlNameEl = document.getElementById("controlName");
const controlHintEl = document.getElementById("controlHint");
const depthSliderEl = document.getElementById("depthSlider");
const depthValueEl = document.getElementById("depthValue");
const depthPresetsEl = document.getElementById("depthPresets");
const counterControlsEl = document.getElementById("counterControls");
const redControlsEl = document.getElementById("redControls");
const hunterControlsEl = document.getElementById("hunterControls");
const counterToggleEl = document.getElementById("counterToggle");
const probeToggleEl = document.getElementById("probeToggle");
const hunterToggleEl = document.getElementById("hunterToggle");
const visionModesEl = document.getElementById("visionModes");
const metricsEl = document.getElementById("metrics");
const quizPromptEl = document.getElementById("quizPrompt");
const quizOptionsEl = document.getElementById("quizOptions");
const quizFeedbackEl = document.getElementById("quizFeedback");
const captionEl = document.getElementById("caption");
const legendEl = document.getElementById("legend");
const interactiveModeBtnEl = document.getElementById("interactiveModeBtn");
const videoModeBtnEl = document.getElementById("videoModeBtn");
const modeStatusEl = document.getElementById("modeStatus");
const videoPanelEl = document.getElementById("videoPanel");
const videoStateEl = document.getElementById("videoState");
const videoNarrationEl = document.getElementById("videoNarration");
const videoPlayPauseBtnEl = document.getElementById("videoPlayPauseBtn");
const videoRestartBtnEl = document.getElementById("videoRestartBtn");
const voiceToggleBtnEl = document.getElementById("voiceToggleBtn");
const videoProgressFillEl = document.getElementById("videoProgressFill");
const videoMetaEl = document.getElementById("videoMeta");
const voiceStatusEl = document.getElementById("voiceStatus");
const stageSectionEl = document.getElementById("stageSection");
const controlSectionEl = document.getElementById("controlSection");
const quizSectionEl = document.getElementById("quizSection");
const askSectionEl = document.getElementById("askSection");
const askModeAskBtnEl = document.getElementById("askModeAskBtn");
const askModeAnswerBtnEl = document.getElementById("askModeAnswerBtn");
const askPromptEl = document.getElementById("askPrompt");
const askInputEl = document.getElementById("askInput");
const askMicBtnEl = document.getElementById("askMicBtn");
const askSubmitBtnEl = document.getElementById("askSubmitBtn");
const askClearBtnEl = document.getElementById("askClearBtn");
const askStatusEl = document.getElementById("askStatus");
const askResponseEl = document.getElementById("askResponse");

const DEFAULT_SOURCE_LABEL = "預設 demo《深海光學戰場》";
const SPACE_SOURCE_LABEL = "預設 demo《宇宙尺度之旅》";
const GENERIC_PALETTE = [0x66c2ff, 0x8c7bff, 0x4ff0c4, 0xffa85a];
const GENERIC_TEMPLATE_IDS = ["constellation", "steps", "contrast", "synthesis"];
const MODEL_ASSET_PATHS = {
  counterFish: "./assets/models/counter-fish.glb",
  predatorShark: "./assets/models/predator-shark.glb",
  crawfish: "./assets/models/crawfish.glb",
  glubEvolved: "./assets/models/glub-evolved.glb",
  barramundiFish: "./assets/models/barramundi-fish.glb",
  damagedHelmet: "./assets/models/damaged-helmet.glb",
  lantern: "./assets/models/lantern.glb",
  boomBox: "./assets/models/boom-box.glb",
};

const SPECTRUM_CHANNELS = [
  { key: "red", label: "紅光", color: 0xff4b57, decay: 0.019 },
  { key: "orange", label: "橙光", color: 0xff9f47, decay: 0.012 },
  { key: "yellow", label: "黃光", color: 0xffef70, decay: 0.0085 },
  { key: "green", label: "綠光", color: 0x42ffad, decay: 0.0052 },
  { key: "blue", label: "藍光", color: 0x56b8ff, decay: 0.0023 },
  { key: "violet", label: "紫光", color: 0x8e6cff, decay: 0.0035 },
];

const DEFAULT_STAGES = [
  {
    id: "spectrum",
    tab: "被剝奪的光譜",
    short: "看見海水如何過濾太陽光。",
    title: "第一節：被剝奪的光譜",
    lead: "海水不是透明背景，而是會主動刪除不同波長的巨大光譜過濾器。",
    body:
      "拖動深度，你會看到紅光最先消失，接著是橙光與黃光；到了約 200 米，中層帶主要只剩藍綠光。超過 1000 米後，太陽光幾乎全被吞噬，深海進入永恆黑暗。",
    facts: ["10–20 m：紅光近乎歸零", "200 m：中層帶只剩藍綠", "1000 m+：半深海帶近乎全黑"],
    quiz: {
      prompt: "為什麼深海生物可以把紅色當作隱身斗篷的前提，是先建立在哪個物理條件上？",
      options: [
        { text: "因為海水會優先吸收紅光", correct: true, feedback: "正確。紅光先被海水吸收，深處根本沒有紅光可反射，紅色表面就不再顯眼。" },
        { text: "因為紅光在海水中傳播最快", correct: false, feedback: "不對。紅光不是傳得最快，而是最先被海水剝奪。" },
        { text: "因為深海生物普遍會發出紅光", correct: false, feedback: "不對。大多數深海生物反而看不到紅光，會發紅光的是少數特殊掠食者。" },
      ],
    },
    openPrompt: "用自己的話解釋：為什麼海水會被稱為「光譜過濾器」？",
    camera: { pos: [0, 1.3, 9.6], target: [0, 0.2, 0] },
    defaultDepth: 200,
  },
  {
    id: "counter",
    tab: "反向照明",
    short: "魚腹主動補光，抹掉黑色剪影。",
    title: "第二節：操縱光線的魔術師",
    lead: "中層帶的危險常來自下方，掠食者會仰望尋找獵物的黑色輪廓。",
    body:
      "點擊「腹部發光」後，魚腹的發光器會把來自上方的微弱藍光向下補回去。當魚腹亮度接近背景光時，下方掠食者看到的剪影會被抹掉，這就是反向照明。",
    facts: ["典型環境：中層帶", "視角關鍵：掠食者從下往上看", "核心機制：匹配背景亮度而非改變體色"],
    quiz: {
      prompt: "反向照明真正想解決的是哪個問題？",
      options: [
        { text: "讓魚在近距離更容易嚇跑敵人", correct: false, feedback: "不對。反向照明的重點不是威嚇，而是減少從下方看見的黑色輪廓。" },
        { text: "讓腹部與上方背景光亮度一致", correct: true, feedback: "正確。魚不是變透明，而是把自己腹部的亮度調到接近背景光。" },
        { text: "把全身變成鮮紅色", correct: false, feedback: "不對。鮮紅色是更深水域另一種吸光策略，不是反向照明。" },
      ],
    },
    openPrompt: "用自己的話解釋：為什麼掠食者要從下往上找剪影，而反向照明能對抗這件事？",
    camera: { pos: [0.15, -0.1, 7.4], target: [0.05, 0.05, 0] },
    defaultDepth: 200,
  },
  {
    id: "red",
    tab: "紅色悖論",
    short: "在深海，紅色會變成最黑的黑。",
    title: "第三節：紅色的終極悖論",
    lead: "紅色物體之所以看起來紅，是因為它反射紅光；但深海裡幾乎沒有紅光可反射。",
    body:
      "觀察紅蝦：在只剩藍綠光的環境裡，它吸收周圍殘餘光線，幾乎像黑洞一樣不反光。打開紅光照射後，紅蝦才重新把紅光反射回來，瞬間從『隱形』變成『發亮』。",
    facts: ["深度示意：800 m", "沒有紅光，就沒有紅色可反射", "紅色在深海等於純黑隱形"],
    quiz: {
      prompt: "在 800 米的黑暗水域裡，一隻鮮紅色的深海蝦為什麼常看起來接近黑色？",
      options: [
        { text: "因為紅色在低溫下會自動變黑", correct: false, feedback: "不對。不是溫度造成，而是沒有紅光可被反射。" },
        { text: "因為它會主動改變皮膚顏色", correct: false, feedback: "不對。重點不是變色，而是環境中缺少紅光可用。" },
        { text: "因為牠吸收殘餘藍綠光，但沒有紅光可反射", correct: true, feedback: "正確。這就是文章說的『紅色悖論』。" },
      ],
    },
    openPrompt: "用自己的話解釋：為什麼一隻在陸地上鮮紅色的蝦，到了八百米深處反而像黑色？",
    camera: { pos: [-0.45, 0.65, 7.7], target: [0.1, -0.1, 0] },
    defaultDepth: 800,
  },
  {
    id: "hunter",
    tab: "紅光刺客",
    short: "黑巨口魚用紅燈破解紅色隱身。",
    title: "第四節：裝備紅外線探照燈的刺客",
    lead: "當『紅色等於黑色』成為普遍防禦時，掠食者就進化出能看見紅光、也能發出紅光的作弊裝備。",
    body:
      "切換到不同視角。全知視角會看到紅光錐；獵物視角幾乎察覺不到紅燈；獵手視角則會看見紅蝦被照亮後立刻暴露。黑巨口魚不是破壞物理學，而是反過來利用別人看不見的光。",
    facts: ["主角：黑巨口魚", "特殊能力：發射並感知紅光", "效果：把隱身紅蝦重新照亮"],
    quiz: {
      prompt: "黑巨口魚能在軍備競賽中占上風，最關鍵的優勢是什麼？",
      options: [
        { text: "牠游得最快，所以能硬追上獵物", correct: false, feedback: "不對。速度不是文章裡最核心的演化優勢。" },
        { text: "牠能製造並看見大多數獵物看不到的紅光", correct: true, feedback: "正確。牠用別人看不見的光照亮紅色獵物。" },
        { text: "牠會把自己塗成藍色", correct: false, feedback: "不對。顏色不是重點，紅光偵測能力才是關鍵。" },
      ],
    },
    openPrompt: "用自己的話描述：黑巨口魚的紅光探照燈為什麼是一種「演化外掛」，它打破了哪一條規則？",
    camera: { pos: [0.25, 0.55, 8.6], target: [0.4, -0.15, 0] },
    defaultDepth: 900,
  },
];

const DEFAULT_VIDEO_SEGMENTS = [
  { stage: "spectrum", durationMs: 6500, depth: 20, narration: "第一節，先把海水想成一個巨大的光譜過濾器。當你從淺水開始下潛，紅光最先被吸收，所以鮮紅色很快就失去存在條件。" },
  { stage: "spectrum", durationMs: 6500, depth: 200, narration: "到了大約兩百米的中層帶，世界只剩下微弱的藍綠光。這不是單純變暗，而是波長被一層一層剝掉後留下來的結果。" },
  { stage: "counter", durationMs: 8000, depth: 200, counterIllumination: true, narration: "第二節，許多中層帶魚類使用反向照明。牠們把腹部亮度調整到接近上方背景光，好讓下方掠食者看不到黑色剪影。" },
  { stage: "counter", durationMs: 5000, depth: 200, counterIllumination: false, narration: "如果把腹部補光關掉，魚就重新變成背景前的一塊黑影。於是你能立刻明白，反向照明的本質是亮度匹配，而不是華麗變色。" },
  { stage: "red", durationMs: 7000, depth: 800, redProbe: false, narration: "第三節，紅色悖論開始生效。在八百米深處幾乎沒有紅光，紅蝦沒有紅光可反射，反而會吸收殘餘藍綠光，所以看起來接近黑洞。" },
  { stage: "red", durationMs: 6000, depth: 800, redProbe: true, narration: "但只要外界重新提供紅光，紅蝦就會立刻把紅光反射回來。這時它不再隱形，而是瞬間暴露自己的位置。" },
  { stage: "hunter", durationMs: 7000, depth: 900, hunterLight: true, visionMode: "prey", narration: "第四節，把視角切到獵物。對多數深海生物來說，黑巨口魚的紅燈幾乎像不存在，因此牠們甚至不知道自己正在被照射。" },
  { stage: "hunter", durationMs: 7000, depth: 900, hunterLight: true, visionMode: "hunter", narration: "再切到獵手視角，紅色獵物在紅光下立刻被照亮。黑巨口魚贏的關鍵，不是速度，而是牠能用別人看不到的光來偵測獵物。" },
];

const state = {
  dataset: null,
  mode: "interactive",
  stage: "",
  hoverMessage: "",
  defaultScene: {
    depth: 200,
    counterIllumination: true,
    redProbe: false,
    hunterLight: true,
    visionMode: "omniscient",
  },
  generatedScene: {
    controlValues: {},
  },
  quizAnswered: {},
  video: {
    activeIndex: 0,
    activeLineIndex: 0,
    playing: false,
    segmentStartMs: 0,
    pausedElapsedMs: 0,
  },
  voice: {
    browserSupported: typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance !== "undefined",
    backendAvailable: false,
    backendProvider: "",
    backendVoice: "",
    backendModel: "",
    enabled: true,
    speaking: false,
    paused: false,
    activeKey: "",
    activeText: "",
    activeSpeaker: "",
    selectedVoiceName: "",
    source: "none",
  },
};

const metricEls = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clickable = [];
const synth = state.voice.browserSupported ? window.speechSynthesis : null;
let availableVoices = [];
const apiAudio = new Audio();
const ttsAudioCache = new Map();
let pendingTtsRequestId = 0;
const gltfLoader = new GLTFLoader();
const externalModelActors = [];

const SPEAKER_VOICES = { narrator: "alloy", prey: "nova", predator: "onyx" };
const SPEAKER_LABELS = { narrator: "🎙️ 旁白", prey: "🦐 獵物", predator: "🦈 掠食者" };
let dialogueLoaded = false;
let activeLineSequence = null;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x06111b, 4.5, 20);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 1.1, 9.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.setClearColor(0x07101a, 1);
app.appendChild(renderer.domElement);

let composer = null;
let bloomPass = null;
let postProcessingEnabled = true;
try {
  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.78, // strength
    0.62, // radius
    0.82, // threshold
  );
  composer.addPass(bloomPass);
} catch (error) {
  console.warn("Post-processing init failed, falling back to direct render.", error);
  composer = null;
  postProcessingEnabled = false;
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.5;
controls.maxDistance = 14;
controls.target.set(0, 0.2, 0);
controls.update();

const ambient = new THREE.AmbientLight(0x7aa7c9, 0.42);
scene.add(ambient);

const hemi = new THREE.HemisphereLight(0xa7e1ff, 0x06111d, 0.82);
hemi.position.set(0, 5, 0);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xb9e7ff, 1.02);
keyLight.position.set(3.5, 7, 4.2);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x27598a, 0.86);
rimLight.position.set(-6, 0.8, -5);
scene.add(rimLight);

const abyssLight = new THREE.PointLight(0x184875, 1.05, 30, 2.1);
abyssLight.position.set(0, -4.5, -5);
scene.add(abyssLight);

const particleField = createParticleField();
scene.add(particleField);

const backgroundDisc = makeGlowDisc(7.6, 0x8fd8ff, 0.22);
backgroundDisc.position.set(0, 3.6, -3.6);
scene.add(backgroundDisc);

const driftVeils = createDriftVeils();
scene.add(driftVeils);

const lightShafts = createLightShafts();
scene.add(lightShafts);

const seafloor = createSeafloor();
scene.add(seafloor);

const defaultRoot = new THREE.Group();
const generatedRoot = new THREE.Group();
scene.add(defaultRoot, generatedRoot);

const defaultStageGroups = {
  spectrum: new THREE.Group(),
  counter: new THREE.Group(),
  red: new THREE.Group(),
  hunter: new THREE.Group(),
};
defaultRoot.add(defaultStageGroups.spectrum, defaultStageGroups.counter, defaultStageGroups.red, defaultStageGroups.hunter);

const generatedTemplates = {
  constellation: createConstellationTemplate(),
  steps: createStepsTemplate(),
  contrast: createContrastTemplate(),
  synthesis: createSynthesisTemplate(),
};
generatedRoot.add(
  generatedTemplates.constellation.group,
  generatedTemplates.steps.group,
  generatedTemplates.contrast.group,
  generatedTemplates.synthesis.group,
);

generatedTemplates.constellation.external = createExternalActor({
  parent: generatedTemplates.constellation.group,
  fallback: new THREE.Group(),
  assetPath: MODEL_ASSET_PATHS.lantern,
  modelScale: 2.2,
  modelPosition: [0, -0.55, 0],
  modelRotation: [0, Math.PI * 0.35, 0],
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x7fd1ff, 0.04);
    generatedTemplates.constellation.core.visible = false;
    generatedTemplates.constellation.halo.visible = false;
    generatedTemplates.constellation.nodes.forEach((node) => { node.visible = false; });
  },
});

generatedTemplates.steps.external = createExternalActor({
  parent: generatedTemplates.steps.group,
  fallback: new THREE.Group(),
  assetPath: MODEL_ASSET_PATHS.damagedHelmet,
  modelScale: 3.2,
  modelPosition: [0, -0.3, 0],
  modelRotation: [0, Math.PI * 0.22, 0],
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0xa492ff, 0.03);
    generatedTemplates.steps.bars.forEach((bar) => { bar.visible = false; });
    generatedTemplates.steps.floor.visible = false;
  },
});

generatedTemplates.contrast.external = createExternalActor({
  parent: generatedTemplates.contrast.group,
  fallback: new THREE.Group(),
  assetPath: MODEL_ASSET_PATHS.barramundiFish,
  modelScale: 3.6,
  modelPosition: [0, -0.2, 0],
  modelRotation: [0, Math.PI, 0],
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x77e2cb, 0.04);
    generatedTemplates.contrast.left.forEach((node) => { node.visible = false; });
    generatedTemplates.contrast.right.forEach((node) => { node.visible = false; });
    generatedTemplates.contrast.bridge.visible = false;
    generatedTemplates.contrast.core.visible = false;
  },
});

generatedTemplates.synthesis.external = createExternalActor({
  parent: generatedTemplates.synthesis.group,
  fallback: new THREE.Group(),
  assetPath: MODEL_ASSET_PATHS.boomBox,
  modelScale: 2.6,
  modelPosition: [0, -0.18, 0],
  modelRotation: [0, Math.PI * 0.24, 0],
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x7dccff, 0.03);
    generatedTemplates.synthesis.ring.visible = false;
    generatedTemplates.synthesis.core.visible = false;
    generatedTemplates.synthesis.shards.forEach((shard) => { shard.visible = false; });
  },
});

let cameraTween = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function shorten(text, max = 32) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function safeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toVector3(values) {
  return new THREE.Vector3(values[0], values[1], values[2]);
}

function collectMaterials(root) {
  const materials = [];
  root?.traverse?.((child) => {
    if (!child.isMesh || !child.material) return;
    const list = Array.isArray(child.material) ? child.material : [child.material];
    list.forEach((material) => {
      if (!materials.includes(material)) materials.push(material);
    });
  });
  return materials;
}

function setShadowFlags(root) {
  root?.traverse?.((child) => {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = false;
      child.frustumCulled = false;
    }
  });
}

function fitModelIntoUnitBox(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x || 0, size.y || 0, size.z || 0, 0.0001);
  const scale = 1 / maxDim;
  root.position.sub(center);
  root.scale.multiplyScalar(scale);
}

function tintModelMaterials(materials, color, emissiveScale = 0.06) {
  const tint = new THREE.Color(color);
  materials.forEach((material) => {
    if (!material?.color) return;
    material.color.lerp(tint, 0.45);
    if ("emissive" in material && material.emissive) {
      material.emissive.copy(tint.clone().multiplyScalar(emissiveScale));
      material.emissiveIntensity = Math.max(material.emissiveIntensity || 0, 0.12);
    }
  });
}

function createExternalActor({
  parent,
  fallback,
  assetPath,
  modelScale = 1,
  modelPosition = [0, 0, 0],
  modelRotation = [0, 0, 0],
  keepFallbackTag = "",
  onLoaded,
}) {
  const actorRoot = new THREE.Group();
  const modelRoot = new THREE.Group();
  actorRoot.add(fallback);
  actorRoot.add(modelRoot);
  modelRoot.visible = false;
  parent.add(actorRoot);

  const actor = {
    group: actorRoot,
    fallback,
    modelRoot,
    assetPath,
    keepFallbackTag,
    materials: collectMaterials(fallback),
    loaded: false,
    onLoaded,
  };
  externalModelActors.push(actor);

  gltfLoader.load(
    assetPath,
    (gltf) => {
      const sceneRoot = gltf.scene || gltf.scenes?.[0];
      if (!sceneRoot) return;
      sceneRoot.updateMatrixWorld(true);
      fitModelIntoUnitBox(sceneRoot);
      sceneRoot.position.set(modelPosition[0], modelPosition[1], modelPosition[2]);
      sceneRoot.rotation.set(modelRotation[0], modelRotation[1], modelRotation[2]);
      sceneRoot.scale.multiplyScalar(modelScale);
      setShadowFlags(sceneRoot);
      sceneRoot.traverse((child) => {
        if (child.isMesh && !clickable.includes(child)) clickable.push(child);
      });
      modelRoot.add(sceneRoot);
      modelRoot.visible = true;
      actor.loaded = true;
      actor.materials = collectMaterials(sceneRoot);

      if (keepFallbackTag) {
        fallback.traverse((child) => {
          if (child === fallback) return;
          if (child.userData?.[keepFallbackTag]) return;
          child.visible = false;
        });
      } else {
        fallback.visible = false;
      }

      onLoaded?.(actor, sceneRoot);
    },
    undefined,
    (error) => {
      console.warn(`Failed to load model: ${assetPath}`, error);
    },
  );

  return actor;
}

function setCaption(text) {
  captionEl.textContent = text;
}

function registerClickable(mesh, message) {
  mesh.userData.info = message;
  clickable.push(mesh);
}

function currentStages() {
  return state.dataset?.stages || [];
}

function currentStage() {
  return currentStages().find((stage) => stage.id === state.stage) || currentStages()[0] || null;
}

function currentVideoSegments() {
  return state.dataset?.videoSegments || [];
}

function totalVideoDurationMs() {
  return currentVideoSegments().reduce((sum, segment) => sum + segment.durationMs, 0);
}

function stageById(stageId) {
  return currentStages().find((stage) => stage.id === stageId) || currentStages()[0] || null;
}

function activeVideoSegment() {
  return currentVideoSegments()[state.video.activeIndex] || null;
}

function channelStrength(depth, decay) {
  return Math.exp(-depth * decay);
}

function computeSpectrum(depth) {
  const result = {};
  for (const channel of SPECTRUM_CHANNELS) result[channel.key] = channelStrength(depth, channel.decay);
  return result;
}

function dominantRemainingChannel(spectrum) {
  return [...SPECTRUM_CHANNELS].sort((a, b) => spectrum[b.key] - spectrum[a.key])[0];
}

function createDefaultDataset() {
  return {
    id: "default-demo",
    type: "default",
    sourceLabel: DEFAULT_SOURCE_LABEL,
    title: "深海光學戰場",
    intro: "這是目前的預設 demo。它把文章拆成 4 個可操作的 3D 實驗，讓你直接觀察光譜剝奪、反向照明、紅色悖論與紅光刺客。",
    legend: [
      "先貼上文字可生成新的教學內容；不輸入時可回到預設 demo。",
      "互動模式下可拖曳旋轉視角，滾輪可縮放。",
      "影片解說模式下會自動運鏡與切章。",
      "點擊場景中的魚腹光點、紅蝦、黑巨口魚紅燈，可看到補充解說。",
    ],
    stages: DEFAULT_STAGES.map((stage) => ({ ...stage })),
    videoSegments: DEFAULT_VIDEO_SEGMENTS.map((segment) => ({ ...segment })),
  };
}

function createSpaceDemoDataset() {
  return {
    id: "space-demo",
    type: "generated",
    sourceLabel: SPACE_SOURCE_LABEL,
    title: "宇宙尺度之旅",
    intro: "這是第二個預設 demo。它把宇宙主題拆成 4 個章節，從太陽系、恆星誕生、黑洞到宇宙網，讓你用 3D 場景與影片解說理解尺度與結構。",
    legend: [
      "這是宇宙主題的預設 demo，可和深海版本來回切換。",
      "互動模式下可切章、拖動參數、觀察節點與外部模型的變化。",
      "影片解說模式下會自動依序播放宇宙腳本與旁白。",
      "若想回到深海版本，可按「載入預設 demo」。",
    ],
    stages: [
      {
        id: "space-1",
        tab: "太陽系",
        short: "從熟悉的尺度開始進入宇宙。",
        title: "第一節：太陽系的秩序",
        lead: "宇宙並不是一團混亂的黑暗，而是由重力塑造出的層層秩序；太陽系就是最容易理解的第一層。",
        body: "從太陽出發，行星沿著穩定軌道運行。當你拉高聚焦度，場景中的結構會更集中，幫助你把注意力放在『中心天體如何支配整個系統』這個概念上。",
        facts: ["中心天體：太陽", "尺度感：行星軌道差異極大", "核心概念：重力建立秩序"],
        camera: { pos: [0.2, 0.8, 8.6], target: [0, 0.2, 0] },
        sceneKey: "constellation",
        accent: 0x79c8ff,
        controlDefault: 52,
        rawText: "宇宙並不是一團混亂的黑暗，而是由重力塑造出的層層秩序；太陽系就是最容易理解的第一層。",
        sentenceCount: 3,
      },
      {
        id: "space-2",
        tab: "恆星誕生",
        short: "星雲如何坍縮成為恆星。",
        title: "第二節：恆星的誕生",
        lead: "恆星誕生於巨大的分子雲。當氣體與塵埃在重力下慢慢坍縮，核心溫度與密度逐步上升。",
        body: "拖動推進度時，你可以把這個過程想成從瀰漫星雲，到原恆星，再到真正點燃核融合的恆星。宇宙中的光，不只是照亮結果，也標記了一個天體是否真正開始發光。",
        facts: ["材料：氣體與塵埃", "驅動力：重力坍縮", "轉折點：核融合點燃"],
        camera: { pos: [0.18, 1.45, 8.9], target: [0, 0.4, 0] },
        sceneKey: "steps",
        accent: 0xa48dff,
        controlDefault: 44,
        rawText: "恆星誕生於巨大的分子雲。當氣體與塵埃在重力下慢慢坍縮，核心溫度與密度逐步上升。",
        sentenceCount: 3,
      },
      {
        id: "space-3",
        tab: "黑洞",
        short: "看不見，卻能改變周圍一切。",
        title: "第三節：黑洞與事件視界",
        lead: "黑洞本身幾乎不發光，但它對周圍時空與物質的影響，反而讓它成為宇宙裡最強烈的存在之一。",
        body: "提高對比度時，你會更容易理解黑洞的學習重點不是『看見黑洞』，而是觀察它如何扭曲附近物質、吸積盤與路徑。黑洞的存在，常常是從周圍現象被反推出來的。",
        facts: ["本體近乎不可見", "可觀察線索：吸積盤", "核心概念：以周圍效應理解主體"],
        camera: { pos: [0, 0.95, 9.1], target: [0, 0.08, 0] },
        sceneKey: "contrast",
        accent: 0x58e0c7,
        controlDefault: 58,
        rawText: "黑洞本身幾乎不發光，但它對周圍時空與物質的影響，反而讓它成為宇宙裡最強烈的存在之一。",
        sentenceCount: 3,
      },
      {
        id: "space-4",
        tab: "宇宙網",
        short: "整個宇宙其實像網狀結構。",
        title: "第四節：宇宙網與大尺度結構",
        lead: "把視角再拉遠，星系並不是均勻撒在空間裡，而是沿著巨大絲狀結構分布，形成所謂的宇宙網。",
        body: "整合度越高，越能理解這些分散節點不是孤立存在，而是透過重力與暗物質骨架形成彼此關聯的超大尺度結構。宇宙的最後一課，往往不是單一天體，而是整體連結。",
        facts: ["單位：星系群與星系團", "形狀：絲狀與節點", "尺度：遠超單一星系"],
        camera: { pos: [0.15, 1.15, 8.2], target: [0, 0.25, 0] },
        sceneKey: "synthesis",
        accent: 0xffb15f,
        controlDefault: 66,
        rawText: "把視角再拉遠，星系並不是均勻撒在空間裡，而是沿著巨大絲狀結構分布，形成所謂的宇宙網。",
        sentenceCount: 3,
      },
    ],
    videoSegments: [
      { stage: "space-1", durationMs: 6200, controlValue: 28, endControlValue: 68, narration: "第一節，從太陽系開始。宇宙不是一團混亂，而是由重力建立秩序；太陽作為中心天體，決定整個系統的基本節奏。" },
      { stage: "space-1", durationMs: 4600, controlValue: 68, endControlValue: 88, narration: "當你先掌握太陽系，就比較能理解後面所有更大尺度結構，其實也都在重力規則下運作。" },
      { stage: "space-2", durationMs: 6200, controlValue: 22, endControlValue: 74, narration: "第二節，恆星並不是憑空出現，而是從巨大的氣體與塵埃雲在重力下慢慢坍縮而來。" },
      { stage: "space-2", durationMs: 4800, controlValue: 74, endControlValue: 92, narration: "當核心足夠熱、足夠密，核融合被點燃，一顆恆星才真正誕生，宇宙中的光也因此被製造出來。" },
      { stage: "space-3", durationMs: 6800, controlValue: 32, endControlValue: 78, narration: "第三節，黑洞最難理解的地方在於，它本身幾乎不可見，但它對周圍物質與時空的影響卻極其劇烈。" },
      { stage: "space-3", durationMs: 5000, controlValue: 78, endControlValue: 94, narration: "所以我們學黑洞，不是直接看見它，而是從吸積盤、運動路徑與扭曲效應反推出它的存在。" },
      { stage: "space-4", durationMs: 6800, controlValue: 38, endControlValue: 82, narration: "第四節，把尺度再拉大。星系並不是均勻散開，而是沿著巨大的絲狀結構串聯，形成宇宙網。" },
      { stage: "space-4", durationMs: 5600, controlValue: 82, endControlValue: 96, narration: "到了這一層，你看到的已不只是單一天體，而是整個宇宙如何在超大尺度上展現連結與結構。" },
    ],
    sourceText: "宇宙尺度之旅\n太陽系、恆星誕生、黑洞與宇宙網",
  };
}

function splitSentences(text) {
  const normalized = String(text || "").replace(/\n+/g, " ").trim();
  const matches = normalized.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

function isLikelyHeading(line) {
  if (!line) return false;
  if (/^第[一二三四五六七八九十0-9]+[章節部分段]/u.test(line)) return true;
  if (/^[一二三四五六七八九十0-9]+[、.．]/u.test(line)) return true;
  if (/[：:]$/.test(line)) return true;
  return line.length <= 18 && !/[，。！？!?；;,.]/.test(line);
}

function chunkArray(items, count) {
  const result = [];
  const size = Math.max(1, Math.ceil(items.length / count));
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function parseSectionsFromText(text) {
  const lines = (text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const sections = [];
  let current = null;

  for (const line of lines) {
    if (isLikelyHeading(line)) {
      if (current && current.content.length) sections.push(current);
      current = { heading: line.replace(/[：:]$/, ""), content: [] };
      continue;
    }

    if (!current) current = { heading: "", content: [] };
    current.content.push(line);
  }

  if (current && current.content.length) sections.push(current);
  if (sections.length >= 2) return sections;

  const paragraphs = lines.join("\n").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    return paragraphs.slice(0, 4).map((paragraph, index) => ({
      heading: `段落 ${index + 1}`,
      content: [paragraph],
    }));
  }

  const sentences = splitSentences(lines.join(" "));
  const chunks = chunkArray(sentences.length ? sentences : lines, Math.min(4, Math.max(2, Math.ceil((sentences.length || lines.length) / 2))));
  return chunks.map((chunk, index) => ({
    heading: `段落 ${index + 1}`,
    content: chunk,
  }));
}

function buildGeneratedQuiz(stages, index) {
  const stage = stages[index];
  const nextStage = stages[(index + 1) % stages.length] || stage;
  const wrongLead = shorten(nextStage.lead || nextStage.body || "背景補充", 20);
  return {
    prompt: `這一節最核心的主軸是什麼？`,
    options: [
      { text: shorten(stage.lead || stage.body || stage.title, 20), correct: true, feedback: `正確。這一節的主軸是：${stage.lead || stage.body}` },
      { text: wrongLead || "只有背景描述", correct: false, feedback: `不對。這個選項比較接近其他段落；本節真正焦點是：${stage.lead || stage.body}` },
      { text: "沒有清楚主軸", correct: false, feedback: `不對。系統已將這一節濃縮成明確主軸：${stage.lead || stage.body}` },
    ],
  };
}

function createGeneratedDataset(text) {
  const cleaned = (text || "").trim();
  if (!cleaned) return createDefaultDataset();

  const lines = cleaned.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] || "自動生成教學";
  const title = firstLine.length <= 26 ? firstLine : shorten(firstLine, 22);
  const sections = parseSectionsFromText(cleaned).slice(0, 4);
  const stageCount = Math.max(2, Math.min(4, sections.length || 1));
  const preparedSections = sections.length ? sections.slice(0, stageCount) : [{ heading: "核心內容", content: [cleaned] }];

  const stages = preparedSections.map((section, index) => {
    const rawText = section.content.join(" ");
    const sentences = splitSentences(rawText);
    const lead = sentences[0] || shorten(rawText, 32);
    const body = sentences.slice(0, 3).join("") || rawText;
    const facts = (sentences.length ? sentences : section.content)
      .map((item) => shorten(item.replace(/^[-•]\s*/, ""), 26))
      .filter(Boolean)
      .slice(0, 4);
    const tab = shorten(section.heading || `段落 ${index + 1}`, 12);
    const visualKind = GENERIC_TEMPLATE_IDS[index % GENERIC_TEMPLATE_IDS.length];
    const accent = GENERIC_PALETTE[index % GENERIC_PALETTE.length];
    const cameras = [
      { pos: [0.2, 0.8, 8.6], target: [0, 0.2, 0] },
      { pos: [0.2, 1.5, 8.9], target: [0, 0.4, 0] },
      { pos: [0, 0.9, 9.2], target: [0, 0.1, 0] },
      { pos: [0.1, 1.2, 8.2], target: [0, 0.25, 0] },
    ];

    return {
      id: `generated-${index + 1}`,
      tab,
      short: shorten(lead, 16),
      title: section.heading || `第 ${index + 1} 節`,
      lead,
      body,
      facts: facts.length ? facts : [shorten(rawText, 24)],
      camera: cameras[index % cameras.length],
      sceneKey: visualKind,
      accent,
      controlDefault: 55,
      rawText,
      sentenceCount: sentences.length || section.content.length,
    };
  });

  stages.forEach((stage, index) => {
    stage.quiz = buildGeneratedQuiz(stages, index);
  });

  const videoSegments = stages.flatMap((stage, index) => [
    {
      stage: stage.id,
      durationMs: 6200,
      controlValue: 28,
      endControlValue: 72,
      narration: `第 ${index + 1} 節，${stage.lead}`,
    },
    {
      stage: stage.id,
      durationMs: 4600,
      controlValue: 72,
      endControlValue: 88,
      narration: stage.body,
    },
  ]);

  return {
    id: `generated-${Date.now()}`,
    type: "generated",
    sourceLabel: `自訂文字 • ${shorten(title, 18)}`,
    title,
    intro: `以下內容由輸入文字自動整理成 ${stages.length} 個章節，並轉成可切換的 3D 互動與影片解說模式。`,
    legend: [
      "這是依據輸入文字生成的通用 3D 教學場景。",
      "互動模式下可切章、拖動參數、點擊節點查看內容摘要。",
      "影片解說模式下會自動依序切章，播出整理後的旁白腳本。",
      "若想回到現在的深海版本，可按「載入預設 demo」。",
    ],
    stages,
    videoSegments,
    sourceText: cleaned,
  };
}

function buildTabs() {
  stageTabsEl.innerHTML = "";
  for (const stage of currentStages()) {
    const button = document.createElement("button");
    button.className = "tab";
    button.dataset.stage = stage.id;
    button.innerHTML = `<div class="tabTitle">${safeHtml(stage.tab)}</div><div class="tabDesc">${safeHtml(stage.short)}</div>`;
    button.addEventListener("click", () => setStage(stage.id));
    stageTabsEl.appendChild(button);
  }
}

function buildMetrics() {
  metricsEl.innerHTML = "";
  metricEls.length = 0;
  for (let i = 0; i < 4; i += 1) {
    const card = document.createElement("div");
    card.className = "metricCard";
    card.innerHTML = `
      <div class="metricName"></div>
      <div class="metricValue"></div>
      <div class="metricHint"></div>
    `;
    metricsEl.appendChild(card);
    metricEls.push({
      name: card.querySelector(".metricName"),
      value: card.querySelector(".metricValue"),
      hint: card.querySelector(".metricHint"),
    });
  }
}

function setMetric(index, name, value, hint) {
  const item = metricEls[index];
  if (!item) return;
  item.name.textContent = name;
  item.value.textContent = value;
  item.hint.textContent = hint;
}

function getCurrentControlConfig(stage = currentStage()) {
  if (!stage) {
    return { label: "參數", hint: "", min: 0, max: 100, step: 1, presets: [20, 55, 85], format: (value) => `${Math.round(value)}%` };
  }

  if (state.dataset?.type === "default") {
    return {
      label: "深度",
      hint: "拖動深度來改變剩餘光譜與整體環境亮度。",
      min: 0,
      max: 1200,
      step: 10,
      presets: [20, 200, 800, 1000],
      format: (value) => `${Math.round(value)} m`,
    };
  }

  const configByScene = {
    constellation: {
      label: "聚焦度",
      hint: "調高聚焦度，讓核心觀點更突出，周圍概念節點圍繞得更緊密。",
      presets: [20, 55, 85],
    },
    steps: {
      label: "推進度",
      hint: "拖動推進度，讓段落中的步驟或層次逐步升起。",
      presets: [15, 50, 90],
    },
    contrast: {
      label: "對比度",
      hint: "調高對比度，放大兩組觀點之間的張力與連接光束。",
      presets: [25, 60, 90],
    },
    synthesis: {
      label: "整合度",
      hint: "拖動整合度，讓零散資訊收束成最後的結論核心。",
      presets: [20, 65, 95],
    },
  };

  const config = configByScene[stage.sceneKey] || configByScene.constellation;
  return {
    label: config.label,
    hint: config.hint,
    min: 0,
    max: 100,
    step: 1,
    presets: config.presets,
    format: (value) => `${Math.round(value)}%`,
  };
}

function getCurrentControlValue(stage = currentStage()) {
  if (!stage) return 0;
  if (state.dataset?.type === "default") return state.defaultScene.depth;
  return state.generatedScene.controlValues[stage.id] ?? stage.controlDefault ?? 55;
}

function setCurrentControlValue(value, stage = currentStage()) {
  if (!stage) return;
  if (state.dataset?.type === "default") {
    state.defaultScene.depth = clamp(Number(value), 0, 1200);
    return;
  }
  state.generatedScene.controlValues[stage.id] = clamp(Number(value), 0, 100);
}

function applyPresetButtons() {
  const stage = currentStage();
  const config = getCurrentControlConfig(stage);
  const currentValue = getCurrentControlValue(stage);
  depthPresetsEl.innerHTML = "";
  for (const preset of config.presets) {
    const button = document.createElement("button");
    button.className = "ghostBtn";
    button.textContent = config.format(preset);
    button.classList.toggle("active", Math.abs(preset - currentValue) < 0.01);
    button.disabled = state.mode === "video";
    button.addEventListener("click", () => {
      setCurrentControlValue(preset, stage);
      depthSliderEl.value = String(preset);
      updateAll();
    });
    depthPresetsEl.appendChild(button);
  }
}

function updateTabs() {
  for (const button of stageTabsEl.querySelectorAll(".tab")) {
    button.classList.toggle("active", button.dataset.stage === state.stage);
    button.disabled = state.mode === "video";
  }
}

function setSectionDisabled(sectionEl, disabled) {
  if (!sectionEl) return;
  sectionEl.classList.toggle("is-disabled", disabled);
  sectionEl.querySelectorAll("button, input").forEach((control) => {
    control.disabled = disabled;
  });
}

function segmentElapsedMs(now = performance.now()) {
  if (state.mode !== "video") return 0;
  if (state.video.playing) return Math.max(0, now - state.video.segmentStartMs);
  return Math.max(0, state.video.pausedElapsedMs);
}

function totalVideoElapsedMs(now = performance.now()) {
  const segments = currentVideoSegments();
  let elapsed = 0;
  for (let i = 0; i < state.video.activeIndex; i += 1) elapsed += segments[i]?.durationMs || 0;
  return elapsed + segmentElapsedMs(now);
}

function activeVoiceSource() {
  if (state.voice.backendAvailable) return "api";
  if (state.voice.browserSupported) return "browser";
  return "none";
}

function preferredVoice(voices) {
  if (!voices.length) return null;

  return (
    voices.find((voice) => /zh[-_](TW|HK)/i.test(voice.lang)) ||
    voices.find((voice) => /yue|cmn/i.test(voice.lang)) ||
    voices.find((voice) => /zh/i.test(voice.lang)) ||
    voices[0]
  );
}

function loadVoiceList() {
  if (!synth) return;
  const voices = synth.getVoices();
  if (!voices.length) return;
  availableVoices = voices;
  const chosen = preferredVoice(voices);
  state.voice.selectedVoiceName = chosen?.name || "";
  updateModeUI();
}

async function loadTtsConfig() {
  try {
    const response = await fetch("/api/tts-config", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    state.voice.backendAvailable = Boolean(payload.available);
    state.voice.backendProvider = payload.provider || "";
    state.voice.backendVoice = payload.voice || "";
    state.voice.backendModel = payload.model || "";
    updateModeUI();
  } catch (_error) {
    state.voice.backendAvailable = false;
    updateModeUI();
  }
}

function stopBrowserNarration() {
  if (!synth) return;
  synth.cancel();
}

async function loadDialogue() {
  if (dialogueLoaded) return;
  try {
    const response = await fetch("./assets/dialogue.zh-Hant.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`dialogue fetch ${response.status}`);
    const payload = await response.json();
    const segments = Array.isArray(payload?.segments) ? payload.segments : [];
    const counts = new Map();
    const lookup = new Map();
    for (const entry of segments) {
      const stage = String(entry?.stage || "");
      if (!stage || !Array.isArray(entry.lines) || !entry.lines.length) continue;
      const order = typeof entry.order === "number" ? entry.order : (counts.get(stage) || 0);
      counts.set(stage, order + 1);
      lookup.set(`${stage}:${order}`, entry.lines.map((line) => ({
        speaker: String(line.speaker || "narrator"),
        text: String(line.text || "").trim(),
      })).filter((line) => line.text));
    }

    const stageCursors = new Map();
    for (const segment of DEFAULT_VIDEO_SEGMENTS) {
      const cursor = stageCursors.get(segment.stage) || 0;
      stageCursors.set(segment.stage, cursor + 1);
      const lines = lookup.get(`${segment.stage}:${cursor}`);
      if (lines && lines.length) {
        segment.lines = lines;
        const minDuration = lines.length * 3200;
        if ((segment.durationMs || 0) < minDuration) segment.durationMs = minDuration;
      }
    }
    dialogueLoaded = true;
    if (state.dataset?.type === "default") {
      state.dataset.videoSegments = DEFAULT_VIDEO_SEGMENTS.map((segment) => ({ ...segment }));
    }
  } catch (error) {
    console.warn("Failed to load multi-character dialogue.", error);
  }
}

function segmentLines(segment) {
  if (!segment) return [];
  if (Array.isArray(segment.lines) && segment.lines.length) return segment.lines;
  if (segment.narration) return [{ speaker: "narrator", text: segment.narration }];
  return [];
}

function formatSegmentNarrationDisplay(segment) {
  const lines = segmentLines(segment);
  if (!lines.length) return "";
  if (lines.length === 1) return lines[0].text;
  return lines.map((line, idx) => {
    const label = SPEAKER_LABELS[line.speaker] || SPEAKER_LABELS.narrator;
    const isActive = state.mode === "video" && idx === (state.video.activeLineIndex || 0);
    return `${isActive ? "▶ " : ""}${label}：${line.text}`;
  }).join("\n");
}

function lineCacheKey(line) {
  const voice = SPEAKER_VOICES[line.speaker] || SPEAKER_VOICES.narrator;
  return `${voice}:${line.text}`;
}

function narrationKeyForSegment(segment, index = state.video.activeIndex) {
  return segment ? `${index}:${segment.stage}:${segmentLines(segment).map((l) => l.speaker + "|" + l.text).join("//")}` : "";
}

function resetVoiceFlags() {
  state.voice.speaking = false;
  state.voice.paused = false;
  state.voice.activeKey = "";
  state.voice.activeText = "";
  state.voice.source = "none";
}

function stopNarration() {
  stopBrowserNarration();
  apiAudio.pause();
  apiAudio.currentTime = 0;
  pendingTtsRequestId += 1;
  if (activeLineSequence) {
    activeLineSequence.cancelled = true;
    activeLineSequence = null;
  }
  resetVoiceFlags();
}

async function fetchLineAudioUrl(line) {
  const key = lineCacheKey(line);
  if (ttsAudioCache.has(key)) return ttsAudioCache.get(key);
  const requestId = ++pendingTtsRequestId;
  const voice = SPEAKER_VOICES[line.speaker] || SPEAKER_VOICES.narrator;
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: line.text, voice }),
  });
  if (!response.ok) {
    let detail = "";
    try {
      const payload = await response.json();
      detail = payload.error || payload.details || "";
    } catch (_error) {
      detail = await response.text();
    }
    throw new Error(detail || `TTS request failed (${response.status})`);
  }
  const audioBlob = await response.blob();
  if (requestId !== pendingTtsRequestId) throw new Error("stale_tts_request");
  const url = URL.createObjectURL(audioBlob);
  ttsAudioCache.set(key, url);
  return url;
}

function speakLineWithBrowser(line) {
  return new Promise((resolve) => {
    if (!state.voice.browserSupported || !line?.text) {
      resolve();
      return;
    }
    stopBrowserNarration();
    const utterance = new SpeechSynthesisUtterance(line.text);
    const chosen = availableVoices.find((voice) => voice.name === state.voice.selectedVoiceName) || preferredVoice(availableVoices);
    if (chosen) utterance.voice = chosen;
    utterance.lang = chosen?.lang || "zh-TW";
    if (line.speaker === "predator") {
      utterance.pitch = 0.7;
      utterance.rate = 0.92;
    } else if (line.speaker === "prey") {
      utterance.pitch = 1.25;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }
    utterance.volume = 1;
    let settled = false;
    const finish = () => { if (!settled) { settled = true; resolve(); } };
    utterance.onend = finish;
    utterance.onerror = finish;
    synth.speak(utterance);
  });
}

function playLineApi(line) {
  return new Promise(async (resolve) => {
    try {
      const url = await fetchLineAudioUrl(line);
      apiAudio.src = url;
      const onEnd = () => {
        apiAudio.removeEventListener("ended", onEnd);
        apiAudio.removeEventListener("error", onErr);
        resolve(true);
      };
      const onErr = () => {
        apiAudio.removeEventListener("ended", onEnd);
        apiAudio.removeEventListener("error", onErr);
        resolve(false);
      };
      apiAudio.addEventListener("ended", onEnd);
      apiAudio.addEventListener("error", onErr);
      await apiAudio.play();
    } catch (error) {
      if (String(error?.message || error) !== "stale_tts_request") {
        console.warn("TTS API line failed, falling back.", error);
      }
      resolve(false);
    }
  });
}

async function speakNarrationForSegment(segment, index = state.video.activeIndex) {
  if (!state.voice.enabled || !segment) {
    stopNarration();
    updateModeUI();
    return;
  }

  const lines = segmentLines(segment);
  if (!lines.length) {
    stopNarration();
    updateModeUI();
    return;
  }

  const key = narrationKeyForSegment(segment, index);
  if (state.voice.activeKey === key && (state.voice.speaking || state.voice.paused)) return;

  stopNarration();
  const sequence = { cancelled: false, key };
  activeLineSequence = sequence;
  state.voice.activeKey = key;
  state.voice.speaking = true;
  state.voice.paused = false;

  for (let i = 0; i < lines.length; i += 1) {
    if (sequence.cancelled || activeLineSequence !== sequence) return;
    if (state.mode !== "video") return;
    if (!state.voice.enabled) return;

    const line = lines[i];
    state.video.activeLineIndex = i;
    state.voice.activeText = line.text;
    state.voice.activeSpeaker = line.speaker;
    state.voice.source = state.voice.backendAvailable ? "api" : "browser";
    updateModeUI();
    updateCaption();

    let ok = false;
    if (state.voice.backendAvailable) {
      ok = await playLineApi(line);
      if (sequence.cancelled || activeLineSequence !== sequence) return;
    }
    if (!ok && state.voice.browserSupported) {
      await speakLineWithBrowser(line);
      if (sequence.cancelled || activeLineSequence !== sequence) return;
    }
  }

  if (activeLineSequence === sequence) {
    state.voice.speaking = false;
    state.voice.paused = false;
    activeLineSequence = null;
    updateModeUI();
  }
}

function pauseNarration() {
  if (!state.voice.enabled) return;
  if (state.voice.source === "api" && !apiAudio.paused) {
    apiAudio.pause();
    state.voice.paused = true;
    state.voice.speaking = false;
    updateModeUI();
    return;
  }

  if (synth && synth.speaking && !synth.paused) {
    synth.pause();
    state.voice.paused = true;
    state.voice.speaking = false;
    state.voice.source = "browser";
    updateModeUI();
  }
}

function resumeNarration() {
  if (!state.voice.enabled) return;
  if (state.voice.source === "api" && apiAudio.src) {
    apiAudio.play().then(() => {
      state.voice.paused = false;
      state.voice.speaking = true;
      state.voice.source = "api";
      updateModeUI();
    }).catch(() => {
      speakNarrationForSegment(activeVideoSegment());
    });
    return;
  }

  if (synth && synth.paused) {
    synth.resume();
    state.voice.paused = false;
    state.voice.speaking = true;
    state.voice.source = "browser";
    updateModeUI();
    return;
  }

  speakNarrationForSegment(activeVideoSegment());
}

function voiceStatusText() {
  if (state.voice.backendAvailable && state.voice.enabled) {
    if (state.voice.paused) return `OpenAI TTS 已暫停 • ${state.voice.backendModel} / ${state.voice.backendVoice}`;
    if (state.voice.speaking) return `OpenAI TTS 播放中 • ${state.voice.backendModel} / ${state.voice.backendVoice}`;
    return `OpenAI TTS 已就緒 • ${state.voice.backendModel} / ${state.voice.backendVoice}`;
  }

  if (!state.voice.enabled) return "語音已靜音，影片仍會照常播放字幕與動畫。";
  if (!state.voice.browserSupported) return "目前沒有可用語音來源。請設定 OPENAI_API_KEY，或改用支援 speechSynthesis 的瀏覽器。";
  if (state.voice.paused) return "語音已暫停，按播放會從目前段落繼續。";
  if (state.voice.speaking) {
    const voiceLabel = state.voice.selectedVoiceName ? ` • ${state.voice.selectedVoiceName}` : "";
    return `瀏覽器語音旁白播放中${voiceLabel}`;
  }
  return state.voice.backendAvailable
    ? `OpenAI TTS 已就緒 • ${state.voice.backendModel} / ${state.voice.backendVoice}`
    : "目前會先使用瀏覽器內建語音；若要真實 TTS，請設定 OPENAI_API_KEY。";
}

function updateModeUI(now = performance.now()) {
  const isInteractive = state.mode === "interactive";
  const isVideo = state.mode === "video";
  const segment = activeVideoSegment();
  const totalDuration = totalVideoDurationMs();
  const totalElapsed = clamp(totalVideoElapsedMs(now), 0, totalDuration || 1);
  const progress = totalDuration ? totalElapsed / totalDuration : 0;
  const segments = currentVideoSegments();

  interactiveModeBtnEl.classList.toggle("active", isInteractive);
  videoModeBtnEl.classList.toggle("active", isVideo);
  modeStatusEl.textContent = `目前模式：${isInteractive ? "互動模式" : "影片解說模式"}`;
  videoPanelEl.hidden = !isVideo;

  setSectionDisabled(stageSectionEl, isVideo);
  setSectionDisabled(controlSectionEl, isVideo);
  setSectionDisabled(quizSectionEl, isVideo);
  controls.enabled = isInteractive;

  if (!isVideo) {
    renderer.domElement.style.cursor = "grab";
    return;
  }

  const stage = segment ? stageById(segment.stage) : null;
  const atEnd = segments.length > 0 && state.video.activeIndex === segments.length - 1 && !state.video.playing && state.video.pausedElapsedMs >= (segment?.durationMs || 0);
  videoStateEl.textContent = atEnd
    ? "播放完成"
    : state.video.playing
      ? `播放中 • ${stage?.title || ""}`
      : `暫停中 • ${stage?.title || ""}`;
  videoNarrationEl.textContent = formatSegmentNarrationDisplay(segment) || "切換到影片模式後，系統會自動依序解說目前載入的章節。";
  videoPlayPauseBtnEl.textContent = state.video.playing ? "暫停" : "播放";
  voiceToggleBtnEl.textContent = `語音：${state.voice.enabled ? "開啟" : "靜音"}`;
  voiceToggleBtnEl.classList.toggle("active", state.voice.enabled && activeVoiceSource() !== "none");
  voiceToggleBtnEl.disabled = activeVoiceSource() === "none";
  voiceStatusEl.textContent = voiceStatusText();
  voiceStatusEl.classList.toggle("is-warning", activeVoiceSource() === "none");
  voiceStatusEl.classList.toggle("is-muted", activeVoiceSource() !== "none" && !state.voice.enabled);
  videoProgressFillEl.style.width = `${Math.round(progress * 100)}%`;
  videoMetaEl.textContent = `${segments.length ? Math.min(state.video.activeIndex + 1, segments.length) : 0} / ${segments.length} • 已播放 ${Math.round(totalElapsed / 1000)} 秒`;
  renderer.domElement.style.cursor = "default";
}

function updateStory() {
  const stage = currentStage();
  if (!stage) return;
  storyTitleEl.textContent = stage.title;
  storyLeadEl.textContent = stage.lead;
  storyBodyEl.textContent = stage.body;
  storyFactsEl.innerHTML = "";
  for (const fact of stage.facts || []) {
    const chip = document.createElement("div");
    chip.className = "fact";
    chip.textContent = fact;
    storyFactsEl.appendChild(chip);
  }
}

function updateQuiz() {
  const stage = currentStage();
  if (!stage?.quiz) return;
  const key = `${state.dataset.id}:${stage.id}`;
  const answered = state.quizAnswered[key];
  quizPromptEl.textContent = stage.quiz.prompt;
  quizOptionsEl.innerHTML = "";

  for (const option of stage.quiz.options) {
    const button = document.createElement("button");
    button.className = "quizOption";
    button.textContent = option.text;
    button.disabled = Boolean(answered) || state.mode === "video";
    button.addEventListener("click", () => {
      state.quizAnswered[key] = option;
      quizFeedbackEl.textContent = option.feedback;
      updateQuiz();
    });

    if (answered && answered.text === option.text) {
      button.style.borderColor = option.correct ? "rgba(110,255,182,0.8)" : "rgba(255,130,130,0.8)";
      button.style.background = option.correct ? "rgba(57,128,96,0.25)" : "rgba(120,34,34,0.25)";
    }

    quizOptionsEl.appendChild(button);
  }

  if (!answered) quizFeedbackEl.textContent = state.mode === "video" ? "影片模式播放時暫停測驗互動。" : "選一個答案，檢查自己是否抓到本節的核心。";
}

function updateControlPanels() {
  const isDefault = state.dataset?.type === "default";
  const stage = currentStage();
  const config = getCurrentControlConfig(stage);
  const value = getCurrentControlValue(stage);

  controlNameEl.textContent = config.label;
  controlHintEl.textContent = config.hint;
  depthSliderEl.min = String(config.min);
  depthSliderEl.max = String(config.max);
  depthSliderEl.step = String(config.step);
  depthSliderEl.value = String(value);
  depthValueEl.textContent = config.format(value);
  depthSliderEl.disabled = state.mode === "video";
  applyPresetButtons();

  counterControlsEl.style.display = isDefault && state.stage === "counter" ? "flex" : "none";
  redControlsEl.style.display = isDefault && state.stage === "red" ? "flex" : "none";
  hunterControlsEl.style.display = isDefault && state.stage === "hunter" ? "block" : "none";

  counterToggleEl.textContent = `腹部發光：${state.defaultScene.counterIllumination ? "開啟" : "關閉"}`;
  counterToggleEl.classList.toggle("active", state.defaultScene.counterIllumination);
  probeToggleEl.textContent = `紅光照射：${state.defaultScene.redProbe ? "開啟" : "關閉"}`;
  probeToggleEl.classList.toggle("active", state.defaultScene.redProbe);
  hunterToggleEl.textContent = `紅光探照燈：${state.defaultScene.hunterLight ? "開啟" : "關閉"}`;
  hunterToggleEl.classList.toggle("active", state.defaultScene.hunterLight);

  visionModesEl.querySelectorAll(".ghostBtn").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.defaultScene.visionMode);
    button.disabled = state.mode === "video";
  });
}

function startCameraTween(position, target, duration = 1000) {
  cameraTween = {
    start: performance.now(),
    duration,
    fromPos: camera.position.clone(),
    toPos: position.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
  };
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function createParticleField(count = 1200) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 18;
    positions[i3 + 1] = (Math.random() - 0.15) * 12;
    positions[i3 + 2] = (Math.random() - 0.5) * 18;
    color.setHSL(0.56 + Math.random() * 0.08, 0.5, 0.65 + Math.random() * 0.15);
    colors[i3 + 0] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createDriftVeils() {
  const group = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 8, 1, 1),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x6fb7ff : 0x80ffd8,
        transparent: true,
        opacity: 0.04,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    veil.position.set((i - 1.5) * 1.8, 1.2 - i * 1.1, -5 - i * 2.5);
    veil.rotation.z = 0.14 - i * 0.09;
    veil.rotation.y = -0.18 + i * 0.06;
    group.add(veil);
  }
  return group;
}

function createLightShafts() {
  const group = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2 + i * 0.06, 0.75 + i * 0.12, 14, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x90d9ff : 0x6cc8ff,
        transparent: true,
        opacity: 0.06 - i * 0.007,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    shaft.position.set(-3 + i * 1.4, 2.8, -4.2 - i * 0.4);
    shaft.rotation.z = 0.24 - i * 0.05;
    shaft.rotation.x = 0.05;
    group.add(shaft);
  }
  return group;
}

function createSeafloor() {
  const group = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(16, 80),
    new THREE.MeshStandardMaterial({
      color: 0x07121d,
      emissive: 0x03070c,
      roughness: 0.98,
      metalness: 0.02,
      transparent: true,
      opacity: 0.98,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.3;
  group.add(floor);

  const shelf = new THREE.Mesh(
    new THREE.RingGeometry(5.5, 12.5, 72),
    new THREE.MeshBasicMaterial({
      color: 0x0f2a42,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  shelf.rotation.x = -Math.PI / 2;
  shelf.position.y = -3.22;
  group.add(shelf);
  return group;
}

function makeBeam(color, x, z, radius) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const geometry = new THREE.CylinderGeometry(radius, radius * 0.55, 11, 18, 1, true);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 2.8, z);
  return mesh;
}

function makeGlowDisc(radius, color, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function makeFin(width, height, color, options = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.5, 0);
  shape.quadraticCurveTo(-width * 0.12, height * 0.82, width * 0.5, 0);
  shape.quadraticCurveTo(width * 0.12, height * 0.1, -width * 0.5, 0);

  const geometry = new THREE.ShapeGeometry(shape, 18);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: options.opacity ?? 0.72,
    side: THREE.DoubleSide,
    roughness: options.roughness ?? 0.38,
    metalness: 0.02,
    transmission: options.transmission ?? 0.18,
    thickness: options.thickness ?? 0.18,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function makeCurveTube(points, radius, color, options = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => point.clone()), false, "centripetal");
  const geometry = new THREE.TubeGeometry(curve, options.segments ?? 42, radius, options.radialSegments ?? 8, false);
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    roughness: options.roughness ?? 0.5,
    metalness: options.metalness ?? 0.04,
    depthWrite: options.depthWrite ?? true,
  });
  return new THREE.Mesh(geometry, material);
}

function createLanternFish() {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x12293b,
    emissive: 0x02070c,
    roughness: 0.82,
    metalness: 0.04,
    clearcoat: 0.18,
    clearcoatRoughness: 0.76,
  });
  const finColor = 0x355f86;

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.64, 1.8, 8, 18), bodyMat);
  body.rotation.z = Math.PI / 2;
  body.scale.set(1.12, 0.72, 0.92);
  group.add(body);
  registerClickable(body, "中層帶魚類的腹部並不是單純變色，而是利用發光器把背景藍光補回去。");

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), bodyMat);
  nose.scale.set(1.2, 0.72, 0.72);
  nose.position.set(1.35, 0.03, 0);
  group.add(nose);

  const tailRoot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 0.5, 12), bodyMat);
  tailRoot.rotation.z = Math.PI / 2;
  tailRoot.position.set(-1.36, 0.01, 0);
  group.add(tailRoot);

  const tailUpper = makeFin(0.84, 0.92, finColor, { opacity: 0.6, transmission: 0.12 });
  tailUpper.position.set(-1.7, 0.04, 0);
  tailUpper.rotation.z = Math.PI / 2.65;
  group.add(tailUpper);

  const tailLower = tailUpper.clone();
  tailLower.rotation.z = Math.PI + Math.PI / 2.65;
  group.add(tailLower);

  const dorsal = makeFin(0.5, 0.72, finColor, { opacity: 0.52, transmission: 0.08 });
  dorsal.position.set(-0.25, 0.58, 0);
  dorsal.rotation.z = -0.03;
  group.add(dorsal);

  const pelvicL = makeFin(0.38, 0.56, finColor, { opacity: 0.46, transmission: 0.1 });
  pelvicL.position.set(0.18, -0.16, 0.42);
  pelvicL.rotation.y = Math.PI / 2.9;
  pelvicL.rotation.z = -0.55;
  group.add(pelvicL);

  const pelvicR = pelvicL.clone();
  pelvicR.position.z = -0.42;
  pelvicR.rotation.y = -Math.PI / 2.9;
  pelvicR.rotation.z = 0.55;
  group.add(pelvicR);

  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xe6f3ff, emissive: 0x16314b, roughness: 0.08, metalness: 0.14 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeMaterial);
  eyeL.position.set(1.22, 0.2, 0.28);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.28;
  group.add(eyeR);

  const photophores = [];
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x8dd9ff, emissive: 0x61caff, emissiveIntensity: 2.1, roughness: 0.04, metalness: 0.08 });
  for (let i = 0; i < 7; i += 1) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), lightMat.clone());
    p.position.set(-0.7 + i * 0.34, -0.32 + Math.cos(i * 0.48) * 0.05, 0.18);
    p.userData.keepWhenExternal = true;
    photophores.push(p);
    group.add(p);
    registerClickable(p, "這些腹部光點代表反向照明。牠們的任務不是發亮炫耀，而是把腹部亮度調到和上方背景光幾乎一樣。");
  }

  const bellyLine = makeCurveTube(
    [
      new THREE.Vector3(-0.82, -0.28, 0.16),
      new THREE.Vector3(-0.3, -0.38, 0.18),
      new THREE.Vector3(0.32, -0.34, 0.2),
      new THREE.Vector3(0.92, -0.2, 0.18),
    ],
    0.03,
    0x74caff,
    { opacity: 0.75, emissive: 0x61caff, emissiveIntensity: 1.2, roughness: 0.18, depthWrite: false },
  );
  group.add(bellyLine);

  const glow = makeGlowDisc(2.4, 0x69bfff, 0.18);
  glow.position.set(0, 2.5, 0);
  return { group, photophores, glow };
}

function createPredator() {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x0c1722,
    emissive: 0x010307,
    roughness: 0.88,
    metalness: 0.02,
    clearcoat: 0.1,
    clearcoatRoughness: 0.82,
  });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.9, 6, 16), mat);
  body.rotation.z = Math.PI / 2;
  body.scale.set(1.06, 0.88, 0.72);
  group.add(body);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.96, 16), mat);
  head.rotation.z = -Math.PI / 2;
  head.scale.set(1, 0.86, 0.62);
  head.position.set(1.18, 0.02, 0);
  group.add(head);

  const lowerJaw = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.62, 12), mat);
  lowerJaw.rotation.z = -Math.PI / 2 + 0.18;
  lowerJaw.scale.set(1, 0.52, 0.38);
  lowerJaw.position.set(1.02, -0.14, 0);
  group.add(lowerJaw);

  const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.46, 10), mat);
  tailStem.rotation.z = Math.PI / 2;
  tailStem.position.set(-1.25, 0.01, 0);
  group.add(tailStem);

  const tailL = makeFin(0.68, 0.82, 0x284a69, { opacity: 0.48, transmission: 0.08 });
  tailL.position.set(-1.52, 0, 0);
  tailL.rotation.z = Math.PI / 2.7;
  group.add(tailL);
  const tailR = tailL.clone();
  tailR.rotation.z = Math.PI + Math.PI / 2.7;
  group.add(tailR);

  const pectoralL = makeFin(0.28, 0.48, 0x284a69, { opacity: 0.36, transmission: 0.06 });
  pectoralL.position.set(0.14, -0.1, 0.26);
  pectoralL.rotation.y = Math.PI / 2.8;
  pectoralL.rotation.z = -0.46;
  group.add(pectoralL);
  const pectoralR = pectoralL.clone();
  pectoralR.position.z = -0.26;
  pectoralR.rotation.y = -Math.PI / 2.8;
  pectoralR.rotation.z = 0.46;
  group.add(pectoralR);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: 0x8ad3ff, transparent: true, opacity: 0.9 }));
  eye.position.set(1.05, 0.16, 0.2);
  group.add(eye);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 3.6, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x65beff, transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  );
  cone.rotation.z = Math.PI;
  cone.position.set(0.1, 1.72, 0);
  group.add(cone);

  return { group, cone };
}

function createShrimp(color = 0x6e0612) {
  const group = new THREE.Group();
  const materials = [];
  const segmentGeo = new THREE.SphereGeometry(0.22, 18, 18);

  for (let i = 0; i < 7; i += 1) {
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      emissive: 0x100204,
      emissiveIntensity: 0.15,
      roughness: 0.56,
      metalness: 0.04,
      clearcoat: 0.28,
      clearcoatRoughness: 0.46,
    });
    materials.push(mat);
    const segment = new THREE.Mesh(segmentGeo, mat);
    segment.scale.set(1.08 - i * 0.07, 0.76 - i * 0.02, 0.64 - i * 0.015);
    segment.position.set(-0.46 + i * 0.25, 0.2 - Math.pow(i * 0.12, 1.18), 0);
    group.add(segment);
  }

  const carapace = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 20), materials[0]);
  carapace.scale.set(1.4, 0.88, 0.82);
  carapace.position.set(-0.56, 0.05, 0);
  group.add(carapace);

  const tailMat = new THREE.MeshPhysicalMaterial({
    color,
    emissive: 0x100204,
    emissiveIntensity: 0.15,
    roughness: 0.5,
    metalness: 0.04,
    clearcoat: 0.26,
    clearcoatRoughness: 0.5,
  });
  const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.28, 10), tailMat);
  tailStem.rotation.z = Math.PI / 2;
  tailStem.position.set(1.12, -0.28, 0);
  group.add(tailStem);
  const tailTop = makeFin(0.52, 0.58, color, { opacity: 0.64, transmission: 0.14 });
  tailTop.position.set(1.34, -0.22, 0);
  tailTop.rotation.z = Math.PI / 2.8;
  group.add(tailTop);
  const tailBottom = tailTop.clone();
  tailBottom.rotation.z = Math.PI + Math.PI / 2.8;
  group.add(tailBottom);
  const tailMid = makeFin(0.42, 0.44, color, { opacity: 0.58, transmission: 0.12 });
  tailMid.position.set(1.28, -0.32, 0);
  tailMid.rotation.z = Math.PI / 2;
  group.add(tailMid);
  materials.push(tailMat);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x22070c, emissive: 0x000000, roughness: 0.1 });
  const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), eyeMat);
  const eye2 = eye1.clone();
  eye1.position.set(-0.64, 0.22, 0.16);
  eye2.position.set(-0.64, 0.22, -0.16);
  group.add(eye1, eye2);

  const antennaL = makeCurveTube(
    [
      new THREE.Vector3(-0.62, 0.18, 0.08),
      new THREE.Vector3(-1.0, 0.34, 0.24),
      new THREE.Vector3(-1.42, 0.42, 0.32),
      new THREE.Vector3(-1.86, 0.3, 0.28),
    ],
    0.012,
    color,
    { roughness: 0.5, metalness: 0.02, opacity: 0.82 },
  );
  group.add(antennaL);
  const antennaR = makeCurveTube(
    [
      new THREE.Vector3(-0.62, 0.18, -0.08),
      new THREE.Vector3(-1.0, 0.34, -0.24),
      new THREE.Vector3(-1.42, 0.42, -0.32),
      new THREE.Vector3(-1.86, 0.3, -0.28),
    ],
    0.012,
    color,
    { roughness: 0.5, metalness: 0.02, opacity: 0.82 },
  );
  group.add(antennaR);

  for (let i = 0; i < 4; i += 1) {
    const legL = makeCurveTube(
      [
        new THREE.Vector3(-0.3 + i * 0.26, -0.06 - i * 0.04, 0.16),
        new THREE.Vector3(-0.16 + i * 0.24, -0.22 - i * 0.03, 0.24),
        new THREE.Vector3(0.02 + i * 0.24, -0.4 - i * 0.02, 0.1),
      ],
      0.01,
      color,
      { roughness: 0.48, metalness: 0.02, opacity: 0.78 },
    );
    group.add(legL);
    const legR = makeCurveTube(
      [
        new THREE.Vector3(-0.3 + i * 0.26, -0.06 - i * 0.04, -0.16),
        new THREE.Vector3(-0.16 + i * 0.24, -0.22 - i * 0.03, -0.24),
        new THREE.Vector3(0.02 + i * 0.24, -0.4 - i * 0.02, -0.1),
      ],
      0.01,
      color,
      { roughness: 0.48, metalness: 0.02, opacity: 0.78 },
    );
    group.add(legR);
  }

  return { group, materials };
}

function createDragonfish() {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1016,
    emissive: 0x020204,
    roughness: 0.82,
    metalness: 0.02,
    clearcoat: 0.16,
    clearcoatRoughness: 0.7,
  });
  const body = makeCurveTube(
    [
      new THREE.Vector3(-1.38, -0.06, 0),
      new THREE.Vector3(-0.5, 0.04, 0),
      new THREE.Vector3(0.5, 0.08, 0),
      new THREE.Vector3(1.26, 0.02, 0),
    ],
    0.2,
    0x0b1016,
    { roughness: 0.78, metalness: 0.02 },
  );
  group.add(body);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.08, 14), mat);
  head.rotation.z = -Math.PI / 2;
  head.scale.set(1.1, 0.7, 0.56);
  head.position.set(1.5, 0.04, 0);
  group.add(head);

  const jawTop = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.96, 12), mat);
  jawTop.rotation.z = -Math.PI / 2;
  jawTop.scale.set(1, 0.46, 0.28);
  jawTop.position.set(1.46, 0.15, 0);
  group.add(jawTop);

  const jawBottom = jawTop.clone();
  jawBottom.position.y = -0.13;
  jawBottom.rotation.z = -Math.PI / 2 + 0.28;
  group.add(jawBottom);

  for (let i = 0; i < 8; i += 1) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.24, 6), new THREE.MeshStandardMaterial({ color: 0xdcecff, roughness: 0.15, metalness: 0.1 }));
    tooth.rotation.z = Math.PI;
    tooth.position.set(1.0 + i * 0.085, -0.08 + Math.sin(i * 0.35) * 0.03, (i % 2 === 0 ? 1 : -1) * 0.045);
    group.add(tooth);
  }

  for (let i = 0; i < 6; i += 1) {
    const spine = makeFin(0.18, 0.34, 0x24384d, { opacity: 0.42, transmission: 0.04 });
    spine.position.set(-0.58 + i * 0.36, 0.26 + Math.sin(i * 0.45) * 0.04, 0);
    spine.rotation.z = -0.1 + i * 0.04;
    group.add(spine);
  }

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), new THREE.MeshBasicMaterial({ color: 0xff3e56, transparent: true, opacity: 1 }));
  lamp.position.set(0.82, -0.5, 0);
  group.add(lamp);
  registerClickable(lamp, "黑巨口魚的致命外掛，是能發出紅光、也能看見紅光；對多數獵物來說，這束光幾乎等於不存在。");

  const barbel = makeCurveTube(
    [
      new THREE.Vector3(0.95, -0.18, 0),
      new THREE.Vector3(0.88, -0.28, 0),
      new THREE.Vector3(0.84, -0.38, 0),
      new THREE.Vector3(0.82, -0.48, 0),
    ],
    0.012,
    0x5a2330,
    { emissive: 0x22050a, emissiveIntensity: 0.2, roughness: 0.5, metalness: 0.02 },
  );
  group.add(barbel);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.48, 3.9, 28, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3559, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  );
  cone.rotation.z = -Math.PI / 2;
  cone.position.set(2.8, -0.5, 0);
  group.add(cone);

  const spot = new THREE.SpotLight(0xff3055, 0, 8, 0.33, 0.45, 1.5);
  spot.position.set(0.82, -0.5, 0);
  spot.target.position.set(3.5, -0.5, 0);
  group.add(spot, spot.target);
  registerClickable(group, "黑巨口魚等於拿著只有自己看得見的紅色探照燈，在黑暗裡搜尋那些自以為隱形的紅色獵物。");

  return { group, cone, lamp, spot };
}

function createConstellationTemplate() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 28, 28),
    new THREE.MeshPhysicalMaterial({ color: 0x8edbff, emissive: 0x153950, emissiveIntensity: 0.44, roughness: 0.16, transmission: 0.12, thickness: 0.6 }),
  );
  group.add(core);
  registerClickable(core, "核心節點代表這一段文字最主要的中心概念。拖動聚焦度後，外圍節點會更緊密地圍繞核心。\n");

  const halo = new THREE.Group();
  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(1.46, 0.03, 10, 120),
    new THREE.MeshBasicMaterial({ color: 0x66c2ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }),
  );
  ringA.rotation.x = Math.PI / 2.3;
  halo.add(ringA);
  const ringB = ringA.clone();
  ringB.rotation.x = Math.PI / 2;
  ringB.rotation.y = 0.9;
  halo.add(ringB);
  group.add(halo);

  const nodes = [];
  for (let i = 0; i < 6; i += 1) {
    const node = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.36, 4, 10),
      new THREE.MeshPhysicalMaterial({ color: 0xc7edff, emissive: 0x153a57, emissiveIntensity: 0.25, roughness: 0.22, transmission: 0.08, thickness: 0.2 }),
    );
    group.add(node);
    nodes.push(node);
    registerClickable(node, "這個概念節點會承接該段中的一個重點句。\n");
  }

  return { group, core, halo, nodes };
}

function createStepsTemplate() {
  const group = new THREE.Group();
  const bars = [];
  for (let i = 0; i < 5; i += 1) {
    const material = new THREE.MeshPhysicalMaterial({ color: 0xa091ff, emissive: 0x211850, emissiveIntensity: 0.18, roughness: 0.2, transmission: 0.05, thickness: 0.4 });
    const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.1, 6, 16), material);
    bar.position.set(-2.2 + i * 1.1, 0, 0);
    bar.scale.y = 0.36;
    group.add(bar);
    bars.push(bar);
    registerClickable(bar, "這座柱體代表這一節中的一個步驟或層次。\n");
  }

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.4, 0.12, 48),
    new THREE.MeshStandardMaterial({ color: 0x10192d, emissive: 0x050a12, roughness: 0.92 }),
  );
  floor.position.y = -0.8;
  group.add(floor);

  return { group, bars, floor };
}

function createContrastTemplate() {
  const group = new THREE.Group();
  const left = [];
  const right = [];
  for (let i = 0; i < 4; i += 1) {
    const leftNode = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 0.42, 4, 10),
      new THREE.MeshPhysicalMaterial({ color: 0x7effde, emissive: 0x11483e, emissiveIntensity: 0.2, roughness: 0.18, transmission: 0.08 }),
    );
    leftNode.position.set(-1.8 - Math.random() * 0.6, -0.8 + i * 0.6, (Math.random() - 0.5) * 0.8);
    leftNode.rotation.z = 0.4;
    group.add(leftNode);
    left.push(leftNode);
    registerClickable(leftNode, "左側節點通常代表這一段中的第一組觀點、條件或例子。\n");

    const rightNode = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 0.42, 4, 10),
      new THREE.MeshPhysicalMaterial({ color: 0xffbe7f, emissive: 0x63350a, emissiveIntensity: 0.2, roughness: 0.18, transmission: 0.08 }),
    );
    rightNode.position.set(1.8 + Math.random() * 0.6, -0.8 + i * 0.6, (Math.random() - 0.5) * 0.8);
    rightNode.rotation.z = -0.4;
    group.add(rightNode);
    right.push(rightNode);
    registerClickable(rightNode, "右側節點通常代表對照觀點、結果或另一組條件。\n");
  }

  const bridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 4.2, 18),
    new THREE.MeshBasicMaterial({ color: 0xc7f4ff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending }),
  );
  bridge.rotation.z = Math.PI / 2;
  group.add(bridge);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 22, 22),
    new THREE.MeshPhysicalMaterial({ color: 0xe2f7ff, emissive: 0x2d566a, emissiveIntensity: 0.3, roughness: 0.16, transmission: 0.06 }),
  );
  group.add(core);
  registerClickable(core, "中央節點代表兩組資訊交會之後形成的判斷核心。\n");

  return { group, left, right, bridge, core };
}

function createSynthesisTemplate() {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.08, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x8ed3ff, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending }),
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 24, 24),
    new THREE.MeshPhysicalMaterial({ color: 0x8ed3ff, emissive: 0x1d4a64, emissiveIntensity: 0.32, roughness: 0.12, transmission: 0.08, thickness: 0.42 }),
  );
  group.add(core);
  registerClickable(core, "這個核心通常代表輸入文字最後收束出的結論或整體 takeaway。\n");

  const shards = [];
  for (let i = 0; i < 8; i += 1) {
    const shard = makeFin(0.26, 0.82, 0x7dcbff, { opacity: 0.56, transmission: 0.14, roughness: 0.24 });
    group.add(shard);
    shards.push(shard);
    registerClickable(shard, "這些碎片代表分散的子觀點，整合度提高時會朝結論核心收束。\n");
  }

  return { group, ring, core, shards };
}

const beamGroup = new THREE.Group();
const beamMeshes = [];
SPECTRUM_CHANNELS.forEach((channel, index) => {
  const mesh = makeBeam(channel.color, -3.1 + index * 1.2, -1.5 + Math.sin(index) * 0.2, 0.36);
  beamGroup.add(mesh);
  beamMeshes.push(mesh);
  registerClickable(mesh, `${channel.label}在海水中的殘存量會隨深度快速下降；紅光最早消失，藍光撐得最久。`);
});
scene.add(beamGroup);

const depthRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.8, 0.03, 10, 64),
  new THREE.MeshBasicMaterial({ color: 0x7dcfff, transparent: true, opacity: 0.35 }),
);
depthRing.rotation.x = Math.PI / 2;
scene.add(depthRing);

const spectrumGlow = makeGlowDisc(2.2, 0x66beff, 0.12);
defaultStageGroups.spectrum.add(spectrumGlow);

const lanternFishBase = createLanternFish();
const lanternFish = createExternalActor({
  parent: defaultStageGroups.counter,
  fallback: lanternFishBase.group,
  assetPath: MODEL_ASSET_PATHS.counterFish,
  modelScale: 2.45,
  modelPosition: [0.1, -0.02, 0],
  modelRotation: [0, Math.PI, 0],
  keepFallbackTag: "keepWhenExternal",
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x74caff, 0.028);
  },
});
lanternFish.photophores = lanternFishBase.photophores;
lanternFish.glow = lanternFishBase.glow;
lanternFish.group.position.set(0, 0.65, 0.2);
lanternFish.glow.position.set(0, 2.65, 0);
lanternFish.group.add(lanternFish.glow);

const lowerPredatorBase = createPredator();
lowerPredatorBase.cone.userData.keepWhenExternal = true;
const lowerPredator = createExternalActor({
  parent: defaultStageGroups.counter,
  fallback: lowerPredatorBase.group,
  assetPath: MODEL_ASSET_PATHS.predatorShark,
  modelScale: 2.7,
  modelPosition: [0.1, 0.18, 0],
  modelRotation: [0, Math.PI, 0],
  keepFallbackTag: "keepWhenExternal",
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x5aa4d8, 0.02);
  },
});
lowerPredator.cone = lowerPredatorBase.cone;
lowerPredator.group.position.set(0.2, -2.2, -0.1);

const redShrimpBase = createShrimp();
const redShrimp = createExternalActor({
  parent: defaultStageGroups.red,
  fallback: redShrimpBase.group,
  assetPath: MODEL_ASSET_PATHS.crawfish,
  modelScale: 2.2,
  modelPosition: [0.08, -0.12, 0],
  modelRotation: [0, Math.PI / 2, 0],
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x7a0d19, 0.03);
  },
});
redShrimp.group.position.set(0.2, -0.2, 0.1);
registerClickable(redShrimp.group, "紅蝦不是主動變黑，而是因為深海裡缺少紅光可反射，剩餘藍綠光又被牠吸收掉。");

const redProbeCone = new THREE.Mesh(
  new THREE.ConeGeometry(0.55, 3.6, 28, 1, true),
  new THREE.MeshBasicMaterial({ color: 0xff3656, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
);
redProbeCone.rotation.z = -Math.PI / 2;
redProbeCone.position.set(-1.7, 0.25, 0);
defaultStageGroups.red.add(redProbeCone);

const redProbeSpot = new THREE.SpotLight(0xff2b4d, 0, 8, 0.32, 0.4, 1.1);
redProbeSpot.position.set(-3.3, 0.25, 0);
redProbeSpot.target.position.set(0.7, -0.15, 0);
defaultStageGroups.red.add(redProbeSpot, redProbeSpot.target);

const redProbeLamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff4967, transparent: true, opacity: 0.95 }));
redProbeLamp.position.set(-3.25, 0.25, 0);
defaultStageGroups.red.add(redProbeLamp);
registerClickable(redProbeLamp, "只要外界重新提供紅光，紅蝦就能把紅光反射回來，隱身效果立刻破功。");

const dragonfishBase = createDragonfish();
dragonfishBase.cone.userData.keepWhenExternal = true;
dragonfishBase.lamp.userData.keepWhenExternal = true;
dragonfishBase.spot.userData.keepWhenExternal = true;
dragonfishBase.spot.target.userData.keepWhenExternal = true;
const dragonfish = createExternalActor({
  parent: defaultStageGroups.hunter,
  fallback: dragonfishBase.group,
  assetPath: MODEL_ASSET_PATHS.glubEvolved,
  modelScale: 2.55,
  modelPosition: [0.06, -0.08, 0],
  modelRotation: [0, Math.PI, 0],
  keepFallbackTag: "keepWhenExternal",
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x385f82, 0.022);
  },
});
dragonfish.cone = dragonfishBase.cone;
dragonfish.lamp = dragonfishBase.lamp;
dragonfish.spot = dragonfishBase.spot;
dragonfish.group.position.set(-2.2, -0.1, 0.1);

const hunterShrimpBase = createShrimp(0x710714);
const hunterShrimp = createExternalActor({
  parent: defaultStageGroups.hunter,
  fallback: hunterShrimpBase.group,
  assetPath: MODEL_ASSET_PATHS.crawfish,
  modelScale: 2.05,
  modelPosition: [0.08, -0.1, 0],
  modelRotation: [0, -Math.PI / 2, 0],
  onLoaded: (actor) => {
    tintModelMaterials(actor.materials, 0x7a0d19, 0.03);
  },
});
hunterShrimp.group.position.set(2.15, -0.35, 0.05);
registerClickable(hunterShrimp.group, "對黑巨口魚來說，紅蝦在紅光照射下會重新亮起；但對多數獵物自己而言，這束紅光幾乎不可見。");

const hunterRevealHalo = new THREE.Mesh(
  new THREE.RingGeometry(0.42, 0.68, 36),
  new THREE.MeshBasicMaterial({ color: 0xff6b7b, transparent: true, opacity: 0.0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
);
hunterRevealHalo.position.set(2.15, -0.35, 0.05);
defaultStageGroups.hunter.add(hunterRevealHalo);

function updateLegend() {
  const lines = state.dataset?.legend || [];
  legendEl.innerHTML = `<strong>操作提示</strong><br />${lines.map((line) => `${safeHtml(line)}<br />`).join("")}`;
}

function updateDatasetMeta() {
  projectTitleEl.textContent = state.dataset?.title || "Luminary";
  introEl.textContent = state.dataset?.intro || "";
  sourceStatusEl.textContent = `目前載入：${state.dataset?.sourceLabel || DEFAULT_SOURCE_LABEL}`;
  updateLegend();
}

function updateEnvironment() {
  const stage = currentStage();
  if (!stage) return;
  const floor = seafloor.children[0];
  const shelf = seafloor.children[1];

  if (state.dataset?.type === "default") {
    const spectrum = computeSpectrum(state.defaultScene.depth);
    const dominant = dominantRemainingChannel(spectrum);
    const depthT = clamp(state.defaultScene.depth / 1200, 0, 1);
    const bg = new THREE.Color().setRGB(mix(0.05, 0.012, depthT), mix(0.125, 0.04, depthT), mix(0.195, 0.08, depthT));

    scene.fog.color.copy(bg);
    renderer.setClearColor(bg, 1);
    ambient.color.copy(new THREE.Color(0.13 * spectrum.blue + 0.05 * spectrum.green, 0.2 * spectrum.blue + 0.09 * spectrum.green, 0.24 + 0.4 * spectrum.blue));
    ambient.intensity = mix(0.62, 0.22, depthT);
    hemi.intensity = mix(1.02, 0.3, depthT);
    keyLight.intensity = mix(1.18, 0.26, depthT);
    rimLight.intensity = mix(0.78, 0.24, depthT);
    abyssLight.intensity = mix(0.62, 1.02, depthT);

    backgroundDisc.material.opacity = 0.12 + spectrum.blue * 0.12;
    backgroundDisc.material.color.set(dominant.color);
    particleField.material.opacity = mix(0.48, 0.24, depthT);
    driftVeils.children.forEach((veil, index) => {
      veil.material.opacity = mix(0.075, 0.02, depthT) * (1 - index * 0.1);
    });
    lightShafts.children.forEach((shaft, index) => {
      shaft.material.opacity = clamp((0.13 - depthT * 0.09) * (1 - index * 0.08), 0.012, 0.14);
    });
    floor.material.color.setRGB(mix(0.028, 0.012, depthT), mix(0.044, 0.02, depthT), mix(0.062, 0.03, depthT));
    floor.material.emissive.setRGB(0.008 + spectrum.blue * 0.014, 0.01 + spectrum.green * 0.016, 0.016 + spectrum.blue * 0.026);
    shelf.material.opacity = mix(0.22, 0.08, depthT);

    beamMeshes.forEach((mesh, index) => {
      const channel = SPECTRUM_CHANNELS[index];
      const amount = spectrum[channel.key];
      const emphasis = state.stage === "spectrum" ? 1 : channel.key === "blue" || channel.key === "green" ? 0.5 : 0.18;
      mesh.material.opacity = clamp(amount * 0.24 * emphasis, 0, 0.24);
      mesh.scale.setScalar(0.82 + amount * 0.75);
      mesh.position.y = 2.1 - depthT * 2.4;
    });

    depthRing.visible = true;
    beamGroup.visible = true;
    depthRing.position.y = 2.4 - depthT * 5.3;
    return;
  }

  const controlT = getCurrentControlValue(stage) / 100;
  const accent = new THREE.Color(stage.accent);
  const bg = new THREE.Color(0x0a111b).lerp(accent.clone().multiplyScalar(0.26), 0.32 + controlT * 0.18);
  scene.fog.color.copy(bg);
  renderer.setClearColor(bg, 1);
  ambient.color.copy(accent.clone().lerp(new THREE.Color(0x9bdcff), 0.58));
  ambient.intensity = 0.38 + controlT * 0.2;
  hemi.intensity = 0.6 + controlT * 0.22;
  keyLight.intensity = 0.68 + controlT * 0.3;
  rimLight.intensity = 0.46 + controlT * 0.22;
  abyssLight.intensity = 0.86 + controlT * 0.2;
  backgroundDisc.material.color.copy(accent.clone().lerp(new THREE.Color(0xcff1ff), 0.14));
  backgroundDisc.material.opacity = 0.14 + controlT * 0.1;
  particleField.material.opacity = 0.4 + controlT * 0.1;
  driftVeils.children.forEach((veil, index) => {
    veil.material.opacity = 0.03 + controlT * 0.04 - index * 0.003;
    veil.material.color.copy(accent.clone().lerp(new THREE.Color(0xbfe7ff), index * 0.1));
  });
  lightShafts.children.forEach((shaft, index) => {
    shaft.material.opacity = 0.03 + controlT * 0.032 - index * 0.002;
    shaft.material.color.copy(accent.clone().lerp(new THREE.Color(0xbfe7ff), 0.22));
  });
  floor.material.color.copy(new THREE.Color(0x0d1824).lerp(accent.clone().multiplyScalar(0.2), 0.3));
  floor.material.emissive.copy(accent.clone().multiplyScalar(0.05));
  shelf.material.opacity = 0.14 + controlT * 0.1;
  shelf.material.color.copy(accent);
  beamGroup.visible = false;
  depthRing.visible = false;
}

function updateStageVisibility() {
  const isDefault = state.dataset?.type === "default";
  defaultRoot.visible = isDefault;
  generatedRoot.visible = !isDefault;

  Object.entries(defaultStageGroups).forEach(([key, group]) => {
    group.visible = isDefault && key === state.stage;
  });

  Object.entries(generatedTemplates).forEach(([key, template]) => {
    template.group.visible = !isDefault && currentStage()?.sceneKey === key;
  });
}

function updateDefaultCounterStage() {
  const glowOn = state.defaultScene.counterIllumination;
  for (const photophore of lanternFish.photophores) {
    photophore.material.emissiveIntensity = glowOn ? 2.5 : 0.08;
    photophore.material.color.set(glowOn ? 0x9be5ff : 0x25384a);
  }
  lanternFish.glow.material.opacity = glowOn ? 0.21 : 0.08;
  lowerPredator.cone.material.opacity = glowOn ? 0.09 : 0.23;
}

function updateDefaultRedStage() {
  const depthSpectrum = computeSpectrum(state.defaultScene.depth);
  const probeOn = state.defaultScene.redProbe;
  redProbeCone.material.opacity = probeOn ? 0.22 : 0.0;
  redProbeSpot.intensity = probeOn ? 10 : 0;
  redProbeLamp.material.opacity = probeOn ? 1 : 0.35;
  const baseVisibility = clamp(0.05 + depthSpectrum.green * 0.14 + depthSpectrum.blue * 0.18, 0.04, 0.25);
  const boosted = probeOn ? 0.56 : baseVisibility;
  for (const material of redShrimp.materials) {
    material.emissiveIntensity = boosted;
    material.emissive.set(probeOn ? 0x5f0915 : 0x080102);
    material.color.set(probeOn ? 0x96111f : 0x4c0710);
  }
}

function updateDefaultHunterStage(timeSeconds) {
  const sweep = Math.sin(timeSeconds * 0.9) * 0.48;
  dragonfish.group.rotation.y = sweep * 0.18;
  dragonfish.cone.rotation.z = -Math.PI / 2 + sweep * 0.28;
  dragonfish.spot.target.position.set(2.25, -0.35 + sweep * 0.55, 0);
  dragonfish.spot.target.updateMatrixWorld();

  const shrimpY = -0.35 + Math.sin(timeSeconds * 1.6) * 0.16;
  hunterShrimp.group.position.y = shrimpY;
  hunterRevealHalo.position.y = shrimpY;

  const lampOn = state.defaultScene.hunterLight;
  dragonfish.spot.intensity = lampOn ? 15 : 0;
  dragonfish.lamp.material.opacity = lampOn ? 1 : 0.28;
  const omniscient = state.defaultScene.visionMode === "omniscient";
  const prey = state.defaultScene.visionMode === "prey";
  const hunter = state.defaultScene.visionMode === "hunter";
  dragonfish.cone.material.opacity = lampOn ? (omniscient ? 0.22 : hunter ? 0.14 : 0.0) : 0.0;
  hunterRevealHalo.material.opacity = lampOn && hunter ? 0.62 : 0.0;

  for (const material of hunterShrimp.materials) {
    if (!lampOn) {
      material.color.set(0x42060f);
      material.emissive.set(0x060001);
      material.emissiveIntensity = 0.08;
      continue;
    }

    if (prey) {
      material.color.set(0x42060f);
      material.emissive.set(0x050001);
      material.emissiveIntensity = 0.06;
    } else if (hunter) {
      material.color.set(0xaa1626);
      material.emissive.set(0x6a0d17);
      material.emissiveIntensity = 0.62;
    } else {
      material.color.set(0x7a0d19);
      material.emissive.set(0x30050b);
      material.emissiveIntensity = 0.24;
    }
  }
}

function updateGeneratedTemplateBindings() {
  if (state.dataset?.type !== "generated") return;
  const stages = currentStages();
  const stageByTemplate = {};
  stages.forEach((stage) => {
    stageByTemplate[stage.sceneKey] = stage;
  });

  const constellationStage = stageByTemplate.constellation;
  if (constellationStage) {
    generatedTemplates.constellation.core.userData.info = `核心概念：${constellationStage.lead}`;
    generatedTemplates.constellation.nodes.forEach((node, index) => {
      node.userData.info = constellationStage.facts[index] || constellationStage.body;
    });
    generatedTemplates.constellation.external.group.userData.info = constellationStage.body;
  }

  const stepsStage = stageByTemplate.steps;
  if (stepsStage) {
    generatedTemplates.steps.bars.forEach((bar, index) => {
      bar.userData.info = stepsStage.facts[index] || stepsStage.body;
    });
    generatedTemplates.steps.external.group.userData.info = stepsStage.body;
  }

  const contrastStage = stageByTemplate.contrast;
  if (contrastStage) {
    generatedTemplates.contrast.left.forEach((node, index) => {
      node.userData.info = contrastStage.facts[index] || contrastStage.lead;
    });
    generatedTemplates.contrast.right.forEach((node, index) => {
      node.userData.info = contrastStage.facts[(index + 2) % contrastStage.facts.length] || contrastStage.body;
    });
    generatedTemplates.contrast.core.userData.info = contrastStage.body;
    generatedTemplates.contrast.external.group.userData.info = contrastStage.body;
  }

  const synthesisStage = stageByTemplate.synthesis;
  if (synthesisStage) {
    generatedTemplates.synthesis.core.userData.info = synthesisStage.lead;
    generatedTemplates.synthesis.shards.forEach((shard, index) => {
      shard.userData.info = synthesisStage.facts[index % synthesisStage.facts.length] || synthesisStage.body;
    });
    generatedTemplates.synthesis.external.group.userData.info = synthesisStage.body;
  }
}

function updateGeneratedVisuals(timeSeconds) {
  if (state.dataset?.type !== "generated") return;
  const stage = currentStage();
  if (!stage) return;
  const controlT = getCurrentControlValue(stage) / 100;
  const accent = new THREE.Color(stage.accent);

  generatedTemplates.constellation.group.rotation.y += 0.0015;
  generatedTemplates.steps.group.rotation.y = Math.sin(timeSeconds * 0.25) * 0.08;
  generatedTemplates.contrast.group.rotation.y = Math.sin(timeSeconds * 0.32) * 0.12;
  generatedTemplates.synthesis.group.rotation.y += 0.001;

  if (stage.sceneKey === "constellation") {
    const template = generatedTemplates.constellation;
    if (template.external.loaded) {
      template.external.group.rotation.y += 0.005;
      template.external.modelRoot.rotation.x = Math.sin(timeSeconds * 0.45) * 0.08;
      template.external.modelRoot.position.y = -0.02 + Math.sin(timeSeconds * 0.8) * 0.06;
      tintModelMaterials(template.external.materials, accent, 0.04);
      return;
    }
    template.core.material.color.copy(accent);
    template.halo.children.forEach((ring, index) => {
      ring.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), index * 0.1));
    });
    template.core.scale.setScalar(0.95 + controlT * 0.28);
    template.halo.scale.setScalar(0.9 + controlT * 0.22);
    template.core.rotation.x += 0.008;
    template.core.rotation.y += 0.012;
    const radius = mix(2.8, 1.6, controlT);
    template.nodes.forEach((node, index) => {
      const angle = timeSeconds * 0.5 + (Math.PI * 2 * index) / template.nodes.length;
      node.visible = index < Math.max(3, Math.min(template.nodes.length, stage.facts.length));
      node.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), 0.18 + index * 0.06));
      node.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * 0.7, Math.sin(angle) * radius * 0.42);
      node.scale.setScalar(0.9 + controlT * 0.55);
    });
  }

  if (stage.sceneKey === "steps") {
    const template = generatedTemplates.steps;
    if (template.external.loaded) {
      template.external.group.rotation.y = Math.sin(timeSeconds * 0.28) * 0.24;
      template.external.modelRoot.position.y = -0.08 + controlT * 0.18;
      template.external.modelRoot.scale.setScalar(1 + controlT * 0.12);
      tintModelMaterials(template.external.materials, accent, 0.035);
      return;
    }
    template.floor.material.color.copy(accent.clone().multiplyScalar(0.22).lerp(new THREE.Color(0x10192d), 0.5));
    template.bars.forEach((bar, index) => {
      const local = clamp(controlT * template.bars.length - index, 0, 1);
      bar.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), index * 0.08));
      bar.scale.y = 0.25 + local * (1.2 + index * 0.24);
      bar.position.y = -0.35 + bar.scale.y * 0.5;
    });
  }

  if (stage.sceneKey === "contrast") {
    const template = generatedTemplates.contrast;
    if (template.external.loaded) {
      template.external.group.rotation.y = Math.sin(timeSeconds * 0.36) * 0.3;
      template.external.modelRoot.rotation.z = Math.sin(timeSeconds * 0.52) * 0.08;
      template.external.modelRoot.position.x = Math.sin(timeSeconds * 0.3) * 0.24;
      tintModelMaterials(template.external.materials, accent, 0.04);
      return;
    }
    const spread = mix(1.1, 2.3, controlT);
    template.bridge.material.opacity = 0.12 + controlT * 0.45;
    template.bridge.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), 0.32));
    template.core.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), 0.48));
    template.left.forEach((node, index) => {
      node.position.x = -spread - index * 0.18;
      node.rotation.x += 0.01;
      node.rotation.y += 0.014;
    });
    template.right.forEach((node, index) => {
      node.position.x = spread + index * 0.18;
      node.rotation.x += 0.012;
      node.rotation.y += 0.008;
    });
  }

  if (stage.sceneKey === "synthesis") {
    const template = generatedTemplates.synthesis;
    if (template.external.loaded) {
      template.external.group.rotation.y += 0.004;
      template.external.modelRoot.position.y = Math.sin(timeSeconds * 0.6) * 0.05;
      template.external.modelRoot.scale.setScalar(1 + controlT * 0.1);
      tintModelMaterials(template.external.materials, accent, 0.03);
      return;
    }
    template.ring.material.color.copy(accent);
    template.core.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), 0.28));
    template.core.scale.setScalar(0.9 + controlT * 0.45);
    template.ring.scale.setScalar(1 + controlT * 0.08);
    template.shards.forEach((shard, index) => {
      const angle = (Math.PI * 2 * index) / template.shards.length + timeSeconds * 0.35;
      const radius = mix(2.8, 1.15, controlT);
      shard.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.4) * 0.6, Math.sin(angle) * radius * 0.4);
      shard.lookAt(template.core.position);
      shard.material.color.copy(accent.clone().lerp(new THREE.Color(0xffffff), index * 0.05));
    });
  }
}

function updateStageMetrics() {
  const stage = currentStage();
  if (!stage) return;

  if (state.dataset?.type === "default") {
    const spectrum = computeSpectrum(state.defaultScene.depth);
    const dominant = dominantRemainingChannel(spectrum);

    if (state.stage === "spectrum") {
      setMetric(0, "深度", `${state.defaultScene.depth} m`, "拖動滑桿，觀察不同波長如何被海水逐步刪除。");
      setMetric(1, "主導光色", dominant.label, "目前在這個深度最可能存活下來的可見波段。");
      setMetric(2, "紅光殘量", formatPercent(spectrum.red), "紅光幾乎最先清零，因此深海紅色經常失去『紅』的基礎。");
      setMetric(3, "藍光殘量", formatPercent(spectrum.blue), "藍光最能深入，因此中層帶常剩下藍綠主色。");
      return;
    }

    if (state.stage === "counter") {
      const exposure = state.defaultScene.counterIllumination ? 0.16 : 0.88;
      setMetric(0, "深度", `${state.defaultScene.depth} m`, "中層帶仍有微弱藍光，正好適合做腹部補光。");
      setMetric(1, "腹部發光", state.defaultScene.counterIllumination ? "已匹配背景" : "關閉補光", "反向照明不是越亮越好，而是要亮到剛好與背景接近。");
      setMetric(2, "剪影暴露", formatPercent(exposure), "掠食者從下往上看時，看到的是輪廓，不是花紋。");
      setMetric(3, "獵手感受", state.defaultScene.counterIllumination ? "難以定位" : "黑影明顯", "當腹部亮度接近背景光，魚的黑色輪廓就會消失。");
      return;
    }

    if (state.stage === "red") {
      const visibility = state.defaultScene.redProbe ? 0.71 : 0.12;
      setMetric(0, "深度", `${state.defaultScene.depth} m`, "這個深度幾乎沒有自然紅光，紅色表面失去發揮舞台。");
      setMetric(1, "可用光譜", `${formatPercent(spectrum.green)} 綠 / ${formatPercent(spectrum.blue)} 藍`, "只剩殘餘藍綠光，因此紅色表面主要在吸光。");
      setMetric(2, "紅蝦可見度", formatPercent(visibility), "關閉紅光時接近黑洞，打開紅光後立刻重新反射。");
      setMetric(3, "隱身狀態", state.defaultScene.redProbe ? "暴露" : "純黑隱形", "紅色在深海不是高調，而是建立在光譜缺失上的低反射策略。");
      return;
    }

    const exposure = state.defaultScene.hunterLight ? (state.defaultScene.visionMode === "hunter" ? 0.84 : state.defaultScene.visionMode === "omniscient" ? 0.42 : 0.08) : 0.05;
    setMetric(0, "深度", `${state.defaultScene.depth} m`, "半深海帶接近全黑，自己發光就成了主動出牌。");
    setMetric(1, "獵手裝備", state.defaultScene.hunterLight ? "紅光探照燈" : "暫時熄燈", "黑巨口魚能製造多數獵物無法感知的紅光。");
    setMetric(2, "觀察視角", state.defaultScene.visionMode === "omniscient" ? "全知" : state.defaultScene.visionMode === "prey" ? "獵物" : "獵手", "切換視角，感受同一束紅光在不同眼睛裡的差異。");
    setMetric(3, "獵物暴露", formatPercent(exposure), "紅光只有在能被感知的一方那裡，才會真正變成資訊優勢。");
    return;
  }

  const controlValue = getCurrentControlValue(stage);
  const index = currentStages().findIndex((item) => item.id === stage.id);
  setMetric(0, "章節位置", `第 ${index + 1} / ${currentStages().length} 節`, "這是根據輸入文字自動切分後的段落順序。");
  setMetric(1, "原文句數", `${stage.sentenceCount} 句`, "系統會用句子密度來濃縮 lead、body 與 facts。");
  setMetric(2, "互動參數", `${Math.round(controlValue)}%`, `${getCurrentControlConfig(stage).label} 越高，場景中的關聯、推進或整合效果越明顯。`);
  setMetric(3, "可點節點", `${stage.facts.length} 個`, "點擊 3D 節點可查看這一節對應的重點句或摘要。");
}

function stageCaption() {
  const stage = currentStage();
  if (!stage) return "";
  if (state.mode === "video") {
    const seg = activeVideoSegment();
    const lines = segmentLines(seg);
    if (!lines.length) return seg?.narration || "";
    const idx = clamp(state.video.activeLineIndex || 0, 0, lines.length - 1);
    const line = lines[idx];
    const label = SPEAKER_LABELS[line.speaker] || SPEAKER_LABELS.narrator;
    return lines.length > 1 ? `${label}：${line.text}` : line.text;
  }
  if (state.hoverMessage) return state.hoverMessage;

  if (state.dataset?.type === "default") {
    if (state.stage === "spectrum") return "拖動深度後注意彩色光柱的變化。你看到的不是單純變暗，而是不同波長被依序刪除。";
    if (state.stage === "counter") {
      return state.defaultScene.counterIllumination
        ? "魚腹已開啟反向照明。想像掠食者在下方抬頭看，原本的黑色剪影正被腹部補光抹平。"
        : "現在腹部補光被關閉，魚的身體重新變成上方背景前的一塊黑影。";
    }
    if (state.stage === "red") {
      return state.defaultScene.redProbe
        ? "紅光重新進入場景後，紅蝦終於有光可反射，於是從黑洞般的低反射狀態變得醒目。"
        : "在沒有紅光的深處，紅蝦不是很紅，而是因為吸收殘餘藍綠光而接近純黑。";
    }
    if (state.defaultScene.visionMode === "prey") {
      return state.defaultScene.hunterLight ? "切到獵物視角後，紅燈幾乎像不存在。這正是黑巨口魚最可怕的地方。" : "黑巨口魚暫時熄燈，獵物沒有被特殊光源鎖定。";
    }
    if (state.defaultScene.visionMode === "hunter") {
      return state.defaultScene.hunterLight ? "切到獵手視角後，紅蝦在紅光下重新暴露，隱身策略被直接破解。" : "獵手視角下也必須先有紅光，才能讓紅色獵物變成可用訊號。";
    }
    return state.defaultScene.hunterLight ? "全知視角會同時展示紅光錐與獵物位置，幫你看懂這場演化軍備競賽的完整因果。" : "紅光探照燈關閉時，黑巨口魚失去最關鍵的視覺外掛。";
  }

  return `${stage.lead} 你可以拖動${getCurrentControlConfig(stage).label}，或點擊節點來查看這一段是如何被整理成教學場景的。`;
}

function updateCaption() {
  setCaption(stageCaption());
}

function setStage(stageId, overrides = {}) {
  const stage = stageById(stageId);
  if (!stage) return;
  state.stage = stage.id;
  state.hoverMessage = "";

  if (state.dataset?.type === "default") {
    state.defaultScene.depth = overrides.depth ?? stage.defaultDepth ?? state.defaultScene.depth;
    state.defaultScene.counterIllumination = overrides.counterIllumination ?? (stage.id === "counter" ? true : state.defaultScene.counterIllumination);
    state.defaultScene.redProbe = overrides.redProbe ?? (stage.id === "red" ? false : state.defaultScene.redProbe);
    state.defaultScene.hunterLight = overrides.hunterLight ?? (stage.id === "hunter" ? true : state.defaultScene.hunterLight);
    state.defaultScene.visionMode = overrides.visionMode ?? (stage.id === "hunter" ? "omniscient" : state.defaultScene.visionMode);
  } else {
    state.generatedScene.controlValues[stage.id] = overrides.controlValue ?? state.generatedScene.controlValues[stage.id] ?? stage.controlDefault;
  }

  depthSliderEl.value = String(getCurrentControlValue(stage));
  startCameraTween(overrides.pos || toVector3(stage.camera.pos), overrides.target || toVector3(stage.camera.target), overrides.durationMs || 1000);
  updateAll();
}

function applyVideoSegment(index, now = performance.now()) {
  const segments = currentVideoSegments();
  const safeIndex = clamp(index, 0, Math.max(0, segments.length - 1));
  const segment = segments[safeIndex];
  if (!segment) return;

  state.video.activeIndex = safeIndex;
  state.video.activeLineIndex = 0;
  state.video.segmentStartMs = now;
  state.video.pausedElapsedMs = 0;

  if (state.dataset?.type === "generated" && typeof segment.controlValue === "number") {
    state.generatedScene.controlValues[segment.stage] = segment.controlValue;
  }

  setStage(segment.stage, {
    depth: segment.depth,
    counterIllumination: segment.counterIllumination,
    redProbe: segment.redProbe,
    hunterLight: segment.hunterLight,
    visionMode: segment.visionMode,
    controlValue: segment.controlValue,
    durationMs: 1400,
  });
  if (state.mode === "video") speakNarrationForSegment(segment, safeIndex);
}

function playVideo(now = performance.now()) {
  state.video.playing = true;
  state.video.segmentStartMs = now - state.video.pausedElapsedMs;
  resumeNarration();
  updateModeUI(now);
}

function pauseVideo(now = performance.now()) {
  state.video.pausedElapsedMs = segmentElapsedMs(now);
  state.video.playing = false;
  pauseNarration();
  updateModeUI(now);
}

function restartVideo(now = performance.now()) {
  if (!currentVideoSegments().length) return;
  stopNarration();
  state.video.activeIndex = 0;
  state.video.playing = true;
  applyVideoSegment(0, now);
  updateModeUI(now);
}

function setMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  state.hoverMessage = "";

  if (mode === "video") {
    restartVideo();
    return;
  }

  state.video.playing = false;
  state.video.pausedElapsedMs = 0;
  stopNarration();
  updateAll();
}

function updateVideoPlayback(now = performance.now()) {
  if (state.mode !== "video") return;
  const segment = activeVideoSegment();
  if (!segment) return;
  const elapsed = segmentElapsedMs(now);
  const progress = clamp(elapsed / segment.durationMs, 0, 1);

  if (state.dataset?.type === "generated" && typeof segment.endControlValue === "number") {
    state.generatedScene.controlValues[segment.stage] = mix(segment.controlValue ?? 0, segment.endControlValue, progress);
  }

  if (!state.video.playing) {
    updateModeUI(now);
    return;
  }

  if (elapsed >= segment.durationMs) {
    if (state.video.activeIndex < currentVideoSegments().length - 1) {
      applyVideoSegment(state.video.activeIndex + 1, now);
      return;
    }
    state.video.playing = false;
    state.video.pausedElapsedMs = segment.durationMs;
    stopNarration();
  }

  updateModeUI(now);
}

function updateAll() {
  updateDatasetMeta();
  updateTabs();
  updateStory();
  updateQuiz();
  updateControlPanels();
  updateEnvironment();
  updateStageVisibility();
  updateGeneratedTemplateBindings();
  updateStageMetrics();
  updateCaption();
  updateModeUI();
  if (typeof updateAskPanel === "function") updateAskPanel();
}

function setDataset(dataset, options = {}) {
  stopNarration();
  state.dataset = dataset;
  state.mode = "interactive";
  state.hoverMessage = "";
  state.video.activeIndex = 0;
  state.video.playing = false;
  state.video.segmentStartMs = 0;
  state.video.pausedElapsedMs = 0;
  state.defaultScene = { depth: 200, counterIllumination: true, redProbe: false, hunterLight: true, visionMode: "omniscient" };
  state.generatedScene.controlValues = {};

  if (dataset.type === "generated") {
    currentStages().forEach((stage) => {
      state.generatedScene.controlValues[stage.id] = stage.controlDefault;
    });
  }

  buildTabs();
  if (options.setInputValue !== false) sourceInputEl.value = dataset.sourceText || sourceInputEl.value;
  const firstStage = dataset.stages[0];
  if (firstStage) setStage(firstStage.id, { durationMs: 0 });
  else updateAll();
}

function onPointerMove(event) {
  if (state.mode !== "interactive") return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickable, true);
  renderer.domElement.style.cursor = hits.length ? "pointer" : "grab";
}

function onPointerDown(event) {
  if (state.mode !== "interactive") return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickable, true);
  if (!hits.length) {
    state.hoverMessage = "";
    updateCaption();
    return;
  }

  let current = hits[0].object;
  let info = "";
  while (current && !info) {
    info = current.userData?.info || "";
    current = current.parent;
  }
  if (info) {
    state.hoverMessage = info;
    updateCaption();
  }
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (composer) composer.setSize(width, height);
  if (bloomPass) bloomPass.setSize(width, height);
}

function animate(now) {
  requestAnimationFrame(animate);
  const t = now * 0.001;

  if (cameraTween) {
    const progress = clamp((now - cameraTween.start) / cameraTween.duration, 0, 1);
    const eased = easeInOut(progress);
    camera.position.lerpVectors(cameraTween.fromPos, cameraTween.toPos, eased);
    controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
    if (progress >= 1) cameraTween = null;
  }

  particleField.rotation.y += 0.0006;
  driftVeils.rotation.y = Math.sin(t * 0.06) * 0.16;
  driftVeils.children.forEach((veil, index) => {
    veil.position.x = (index - 1.5) * 1.8 + Math.sin(t * (0.18 + index * 0.04)) * 0.6;
    veil.position.y = 1.1 - index * 1.1 + Math.sin(t * (0.32 + index * 0.09)) * 0.18;
  });
  lightShafts.children.forEach((shaft, index) => {
    shaft.position.x = -3 + index * 1.4 + Math.sin(t * (0.22 + index * 0.05)) * 0.16;
    shaft.rotation.z = 0.2 - index * 0.05 + Math.sin(t * (0.15 + index * 0.03)) * 0.02;
  });
  seafloor.rotation.z = Math.sin(t * 0.03) * 0.02;
  spectrumGlow.rotation.z += 0.002;
  beamGroup.rotation.y = Math.sin(t * 0.08) * 0.1;
  lanternFish.group.position.x = Math.sin(t * 0.7) * 0.15;
  lanternFish.group.position.y = 0.65 + Math.sin(t * 1.4) * 0.08;
  lanternFish.group.rotation.z = Math.sin(t * 1.3) * 0.05;
  lowerPredator.group.position.x = Math.sin(t * 0.5) * 0.18;
  lowerPredator.group.position.y = -2.2 + Math.sin(t * 0.8) * 0.1;
  redShrimp.group.rotation.y = Math.sin(t * 1.0) * 0.25;
  redShrimp.group.position.y = -0.2 + Math.sin(t * 1.5) * 0.15;
  redProbeCone.rotation.z = -Math.PI / 2 + Math.sin(t * 0.9) * 0.12;

  updateDefaultCounterStage();
  updateDefaultRedStage();
  updateDefaultHunterStage(t);
  updateGeneratedVisuals(t);
  updateVideoPlayback(now);
  updateStageMetrics();
  updateCaption();

  controls.update();
  if (composer && postProcessingEnabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

buildMetrics();
setDataset(createDefaultDataset(), { setInputValue: false });

interactiveModeBtnEl.addEventListener("click", () => setMode("interactive"));
videoModeBtnEl.addEventListener("click", () => setMode("video"));

videoPlayPauseBtnEl.addEventListener("click", () => {
  if (state.mode !== "video") return;
  if (state.video.playing) pauseVideo();
  else playVideo();
});

videoRestartBtnEl.addEventListener("click", () => {
  if (state.mode !== "video") return;
  restartVideo();
});

voiceToggleBtnEl.addEventListener("click", () => {
  if (activeVoiceSource() === "none") return;
  state.voice.enabled = !state.voice.enabled;
  if (!state.voice.enabled) stopNarration();
  else if (state.mode === "video" && state.video.playing) resumeNarration();
  updateModeUI();
});

generateBtnEl.addEventListener("click", () => {
  const text = sourceInputEl.value.trim();
  if (!text) {
    sourceStatusEl.textContent = "請先輸入文字，再生成互動與影片。";
    return;
  }
  setDataset(createGeneratedDataset(text), { setInputValue: true });
});

loadDefaultBtnEl.addEventListener("click", () => {
  setDataset(createDefaultDataset(), { setInputValue: false });
});

loadSpaceDemoBtnEl.addEventListener("click", () => {
  setDataset(createSpaceDemoDataset(), { setInputValue: false });
});

depthSliderEl.addEventListener("input", (event) => {
  setCurrentControlValue(Number(event.target.value));
  updateAll();
});

counterToggleEl.addEventListener("click", () => {
  state.defaultScene.counterIllumination = !state.defaultScene.counterIllumination;
  state.hoverMessage = "";
  updateAll();
});

probeToggleEl.addEventListener("click", () => {
  state.defaultScene.redProbe = !state.defaultScene.redProbe;
  state.hoverMessage = "";
  updateAll();
});

hunterToggleEl.addEventListener("click", () => {
  state.defaultScene.hunterLight = !state.defaultScene.hunterLight;
  state.hoverMessage = "";
  updateAll();
});

visionModesEl.querySelectorAll(".ghostBtn").forEach((button) => {
  button.addEventListener("click", () => {
    state.defaultScene.visionMode = button.dataset.mode;
    state.hoverMessage = "";
    updateAll();
  });
});

// === Ask & Answer panel ===
const askState = {
  mode: "ask",
  busy: false,
  recording: false,
  recorder: null,
  recorderChunks: [],
  recorderTimer: 0,
};

function chapterContextForAsk() {
  const stage = currentStage();
  if (!stage) return "";
  const facts = (stage.facts || []).map((f, i) => `- ${f}`).join("\n");
  return [
    `章節標題：${stage.title || ""}`,
    `章節摘要：${stage.lead || ""}`,
    `章節說明：${stage.body || ""}`,
    facts ? `關鍵事實：\n${facts}` : "",
  ].filter(Boolean).join("\n\n");
}

function setAskStatus(text, kind = "") {
  askStatusEl.textContent = text || "";
  askStatusEl.classList.toggle("is-error", kind === "error");
  askStatusEl.classList.toggle("is-busy", kind === "busy");
}

function setAskResponse(html, verdict = null) {
  if (!html) {
    askResponseEl.classList.remove("is-visible");
    askResponseEl.innerHTML = "";
    return;
  }
  const verdictBadge = verdict ? `<div class="verdict ${verdict}">${verdictLabel(verdict)}</div>` : "";
  askResponseEl.innerHTML = `${verdictBadge}<div>${html}</div>`;
  askResponseEl.classList.add("is-visible");
}

function verdictLabel(v) {
  if (v === "correct") return "✓ 答對了";
  if (v === "partial") return "◐ 部分正確";
  if (v === "wrong") return "✗ 還沒對";
  return v;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function updateAskPanel() {
  const stage = currentStage();
  askModeAskBtnEl.classList.toggle("active", askState.mode === "ask");
  askModeAnswerBtnEl.classList.toggle("active", askState.mode === "answer");
  if (askState.mode === "answer") {
    const prompt = stage?.openPrompt || "用自己的話總結這一節最重要的觀念。";
    askPromptEl.textContent = `題目：${prompt}`;
    askInputEl.placeholder = "用一兩句話寫下你的答案，AI 會用本章內容判斷對不對。";
    askSubmitBtnEl.textContent = "提交答案";
  } else {
    askPromptEl.textContent = "對這一節有任何疑問都可以直接問。AI 會用本章內容回答你。";
    askInputEl.placeholder = "例如：為什麼紅色在深海會變黑？";
    askSubmitBtnEl.textContent = "詢問";
  }
}

async function submitAsk() {
  if (askState.busy) return;
  const userText = askInputEl.value.trim();
  if (!userText) {
    setAskStatus("請先輸入或錄音問題。", "error");
    return;
  }
  const stage = currentStage();
  const context = chapterContextForAsk();
  const mode = askState.mode;
  let messages;
  if (mode === "ask") {
    messages = [
      { role: "system", content: `你是 Luminary 深海科普導師。請根據以下章節內容回答學生問題。回答要短、口語、最多 3 句。如果問題與章節無關，可以禮貌帶回主題。\n\n${context}` },
      { role: "user", content: userText },
    ];
  } else {
    const openPrompt = stage?.openPrompt || "";
    messages = [
      { role: "system", content: `你是 Luminary 深海科普老師，要評閱學生答題。題目與章節內容如下，請判斷學生答案的正確程度。\n\n${context}\n\n題目：${openPrompt}\n\n回覆要：第一行包在 <verdict>correct</verdict>、<verdict>partial</verdict> 或 <verdict>wrong</verdict>，接著用 1-3 句話說明關鍵點與缺漏。語氣要鼓勵但精準。` },
      { role: "user", content: `學生答案：${userText}` },
    ];
  }

  askState.busy = true;
  askSubmitBtnEl.disabled = true;
  setAskStatus(mode === "ask" ? "AI 思考中…" : "AI 評分中…", "busy");
  setAskResponse("");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || payload.details || `HTTP ${response.status}`);
    }
    const data = await response.json();
    setAskStatus("");
    setAskResponse(escapeHtml(data.reply || "(沒有回覆)"), data.verdict || null);
  } catch (error) {
    setAskStatus(`AI 回應失敗：${error.message || error}`, "error");
  } finally {
    askState.busy = false;
    askSubmitBtnEl.disabled = false;
  }
}

async function startMicRecording() {
  if (askState.recording) return;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setAskStatus("此瀏覽器不支援錄音，請改用打字。", "error");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    askState.recorderChunks = [];
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) askState.recorderChunks.push(event.data);
    });
    recorder.addEventListener("stop", async () => {
      stream.getTracks().forEach((track) => track.stop());
      askState.recording = false;
      askMicBtnEl.classList.remove("is-recording");
      const blob = new Blob(askState.recorderChunks, { type: recorder.mimeType || "audio/webm" });
      askState.recorderChunks = [];
      if (blob.size === 0) {
        setAskStatus("沒有錄到聲音。", "error");
        return;
      }
      await transcribeBlob(blob);
    });
    recorder.start();
    askState.recorder = recorder;
    askState.recording = true;
    askMicBtnEl.classList.add("is-recording");
    setAskStatus("錄音中… 再點一次麥克風結束（最多 30 秒）。", "busy");
    askState.recorderTimer = window.setTimeout(() => stopMicRecording(), 30_000);
  } catch (error) {
    setAskStatus(`無法啟動麥克風：${error.message || error}`, "error");
  }
}

function stopMicRecording() {
  if (!askState.recording || !askState.recorder) return;
  if (askState.recorderTimer) {
    clearTimeout(askState.recorderTimer);
    askState.recorderTimer = 0;
  }
  try {
    askState.recorder.stop();
  } catch (_error) {
    // already stopped
  }
}

async function transcribeBlob(blob) {
  setAskStatus("辨識語音中…", "busy");
  try {
    const formData = new FormData();
    formData.append("audio", blob, "speech.webm");
    const response = await fetch("/api/transcribe", { method: "POST", body: formData });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || payload.details || `HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.text) {
      askInputEl.value = (askInputEl.value ? `${askInputEl.value} ` : "") + data.text;
      setAskStatus("已轉成文字，可繼續編輯或直接送出。", "");
    } else {
      setAskStatus("沒有辨識出內容，請再試一次。", "error");
    }
  } catch (error) {
    setAskStatus(`語音辨識失敗：${error.message || error}`, "error");
  }
}

askModeAskBtnEl.addEventListener("click", () => {
  askState.mode = "ask";
  setAskResponse("");
  setAskStatus("");
  updateAskPanel();
  askInputEl.focus();
});

askModeAnswerBtnEl.addEventListener("click", () => {
  askState.mode = "answer";
  setAskResponse("");
  setAskStatus("");
  updateAskPanel();
  askInputEl.focus();
});

askSubmitBtnEl.addEventListener("click", () => { submitAsk(); });
askInputEl.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    submitAsk();
  }
});

askClearBtnEl.addEventListener("click", () => {
  askInputEl.value = "";
  setAskResponse("");
  setAskStatus("");
});

askMicBtnEl.addEventListener("click", () => {
  if (askState.recording) stopMicRecording();
  else startMicRecording();
});

updateAskPanel();

renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerdown", onPointerDown);
renderer.domElement.addEventListener("pointerleave", () => {
  renderer.domElement.style.cursor = state.mode === "interactive" ? "grab" : "default";
});

apiAudio.preload = "auto";
apiAudio.addEventListener("ended", () => {
  if (state.voice.source !== "api") return;
  state.voice.speaking = false;
  state.voice.paused = false;
  updateModeUI();
});
apiAudio.addEventListener("pause", () => {
  if (state.voice.source !== "api" || apiAudio.ended) return;
  state.voice.speaking = false;
  state.voice.paused = true;
  updateModeUI();
});
apiAudio.addEventListener("error", () => {
  if (state.voice.source !== "api") return;
  state.voice.speaking = false;
  state.voice.paused = false;
  updateModeUI();
});

if (synth) {
  loadVoiceList();
  synth.addEventListener?.("voiceschanged", loadVoiceList);
  if ("onvoiceschanged" in synth) synth.onvoiceschanged = loadVoiceList;
}
loadTtsConfig();
loadDialogue().then(() => updateModeUI());

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  if (event.shiftKey && (event.key === "B" || event.key === "b")) {
    postProcessingEnabled = !postProcessingEnabled;
    console.log(`Post-processing ${postProcessingEnabled ? "ON" : "OFF"}`);
  }
});
resize();
renderer.domElement.style.cursor = "grab";
requestAnimationFrame(animate);
