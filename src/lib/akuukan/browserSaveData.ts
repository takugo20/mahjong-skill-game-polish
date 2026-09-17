import type {
  AkuukanSaveData
} from "./saveData";
import { createSkillTestSaveData, isSkillTestMode, SKILL_TEST_STORAGE_KEY } from "./skillTestMode";
import {
  loadAkuukanSaveData,
  saveAkuukanSaveData
} from "./saveDataStorage";
import type {
  AkuukanSaveDataLoadResult,
  AkuukanSaveDataSaveResult,
  AkuukanSaveDataStorage
} from "./saveDataStorage";

const UNAVAILABLE_BROWSER_STORAGE:
  AkuukanSaveDataStorage = {
    getItem(): string | null {
      throw new Error(
        "ブラウザの保存領域を利用できません。"
      );
    },
    setItem(): void {
      throw new Error(
        "ブラウザの保存領域を利用できません。"
      );
    }
  };

function getBrowserSaveDataStorage():
  AkuukanSaveDataStorage {
  if (typeof window === "undefined") {
    return UNAVAILABLE_BROWSER_STORAGE;
  }

  try {
    const storage = window.localStorage;
    if (isSkillTestMode()) {
      return {
        getItem: () => storage.getItem(SKILL_TEST_STORAGE_KEY),
        setItem: (_key, value) => storage.setItem(SKILL_TEST_STORAGE_KEY, value)
      };
    }
    return storage;
  } catch {
    return UNAVAILABLE_BROWSER_STORAGE;
  }
}

export function loadAkuukanSaveDataFromBrowser():
  AkuukanSaveDataLoadResult {
  const result = loadAkuukanSaveData(
    getBrowserSaveDataStorage()
  );
  if (isSkillTestMode() && result.source === "initial" && result.failureReason === null) {
    return { ...result, saveData: createSkillTestSaveData() };
  }
  return result;
}

export function saveAkuukanSaveDataToBrowser(
  saveData: AkuukanSaveData
): AkuukanSaveDataSaveResult {
  return saveAkuukanSaveData(
    getBrowserSaveDataStorage(),
    saveData
  );
}
