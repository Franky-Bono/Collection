import { useAtomValue } from "jotai";
import { languageAtom } from "@/state/atoms";
import { t, type TranslationKey } from "./translations";

export function useT() {
  const lang = useAtomValue(languageAtom);
  return (key: TranslationKey, vars?: Record<string, string | number>) => t(lang, key, vars);
}
