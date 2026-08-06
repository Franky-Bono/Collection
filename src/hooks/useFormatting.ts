import { useAtomValue } from "jotai";
import { thousandSeparatorAtom, dateFormatAtom } from "@/state/atoms";
import type { ThousandSeparator, DateFormat } from "@/state/atoms";
import dayjs from "dayjs";

export function formatNumber(n: number, sep: ThousandSeparator): string {
  if (sep === "") return String(n);
  const dec = sep === "," ? "." : ",";
  return n.toLocaleString("en-US").replace(/,/g, sep).replace(/\./g, dec);
}

export function formatDate(isoDate: string, fmt: DateFormat): string {
  return dayjs(isoDate).format(fmt);
}

export function useFormatting() {
  const thousandSeparator = useAtomValue(thousandSeparatorAtom);
  const dateFormat = useAtomValue(dateFormatAtom);
  return {
    formatNumber: (n: number) => formatNumber(n, thousandSeparator),
    formatDate: (isoDate: string) => formatDate(isoDate, dateFormat),
  };
}
