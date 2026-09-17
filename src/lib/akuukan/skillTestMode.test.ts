// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from "vitest";
import { createSkillTestSaveData, SKILL_TEST_STORAGE_KEY } from "./skillTestMode";
import { loadAkuukanSaveDataFromBrowser, saveAkuukanSaveDataToBrowser } from "./browserSaveData";
import { AKUUKAN_SAVE_DATA_STORAGE_KEY } from "./saveDataStorage";
import { createInitialAkuukanSaveData } from "./saveData";
import { isAkuukanSaveData } from "./saveDataValidation";
import { PLAYER_SKILL_CATALOG } from "./playerSkillCatalog";
import { getPlayerSkillMaxLevel } from "./playerSkillCatalogTypes";
import { ENEMY_CATALOG } from "./enemyCatalog";
import { tryStartAkuukanMatchFromSaveData } from "./saveDataMatchStart";

beforeEach(() => { localStorage.clear(); history.replaceState(null, "", "/?test=1"); });
afterEach(() => { localStorage.clear(); history.replaceState(null, "", "/"); });

it("全80スキルが各スキルの最高レベルで解放され、検証可能なデータになる", () => {
  const save = createSkillTestSaveData();
  expect(isAkuukanSaveData(save)).toBe(true);
  expect(PLAYER_SKILL_CATALOG).toHaveLength(80);
  for (const skill of PLAYER_SKILL_CATALOG) {
    expect(save.playerSkillGrowth.skills[skill.id]).toEqual({
      isUnlocked: true, level: getPlayerSkillMaxLevel(skill), currentExp: 0
    });
  }
});

it("最高レベルのスキルを10個装備して全16敵との対局を開始できる", () => {
  const save = {
    ...createSkillTestSaveData(),
    equippedSkills: PLAYER_SKILL_CATALOG.slice(0, 10).map(skill => ({ id: skill.id, level: getPlayerSkillMaxLevel(skill) }))
  };
  for (const enemy of ENEMY_CATALOG) {
    expect(tryStartAkuukanMatchFromSaveData(save, enemy.id).succeeded).toBe(true);
  }
});

it("検証用の装備を復元し、通常データを読み書きせず元の進行状態に戻れる", () => {
  const normal = JSON.stringify(createInitialAkuukanSaveData());
  localStorage.setItem(AKUUKAN_SAVE_DATA_STORAGE_KEY, normal);
  const loaded = loadAkuukanSaveDataFromBrowser();
  expect(loaded.failureReason).toBeNull();
  expect(loaded.saveData.enemyProgress.enemies["enemy-16"].isUnlocked).toBe(true);
  const save = { ...loaded.saveData, equippedSkills: [{ id: "1-1" as const, level: 5 as const }] };
  expect(saveAkuukanSaveDataToBrowser(save).succeeded).toBe(true);
  expect(localStorage.getItem(SKILL_TEST_STORAGE_KEY)).not.toBeNull();
  expect(localStorage.getItem(AKUUKAN_SAVE_DATA_STORAGE_KEY)).toBe(normal);
  expect(loadAkuukanSaveDataFromBrowser().saveData.equippedSkills).toEqual(save.equippedSkills);
  history.replaceState(null, "", "/");
  expect(loadAkuukanSaveDataFromBrowser().saveData).toEqual(JSON.parse(normal));
});
