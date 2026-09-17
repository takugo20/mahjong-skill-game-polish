import { createInitialAkuukanSaveData, type AkuukanSaveData } from "./saveData";
import { PLAYER_SKILL_CATALOG } from "./playerSkillCatalog";
import { getPlayerSkillMaxLevel } from "./playerSkillCatalogTypes";
import type { PlayerSkillProgressById } from "./playerSkillProgress";
import { ENEMY_CATALOG } from "./enemyCatalog";
import type { EnemyProgressById } from "./enemyProgress";

export const SKILL_TEST_STORAGE_KEY = "mahjong-skill-game-polish:skill-test-save-data";

export function isSkillTestMode(): boolean {
  return typeof window !== "undefined"
    && new URLSearchParams(window.location?.search ?? "").get("test") === "1";
}

export function createSkillTestSaveData(): AkuukanSaveData {
  const initial = createInitialAkuukanSaveData();
  return {
    ...initial,
    playerSkillGrowth: {
      ...initial.playerSkillGrowth,
      skills: Object.fromEntries(PLAYER_SKILL_CATALOG.map(skill => [skill.id, {
        isUnlocked: true,
        level: getPlayerSkillMaxLevel(skill),
        currentExp: 0
      }])) as PlayerSkillProgressById
    },
    enemyProgress: {
      enemies: Object.fromEntries(ENEMY_CATALOG.map(enemy => [enemy.id, {
        isUnlocked: true,
        // 通常の保存形式が要求する解放条件も満たす。実戦の統計は別管理。
        firstPlaceCount: Math.max(0, ...ENEMY_CATALOG.map(candidate =>
          candidate.unlockCondition?.requiredEnemyId === enemy.id
            ? candidate.unlockCondition.requiredFirstPlaceCount : 0))
      }])) as EnemyProgressById
    }
  };
}
