import { describe, expect, it } from "vitest";
import { ActionType } from "./action";
import {
  isAddLostFoundReducer,
  isChangeCoverLostFoundReducer,
  isChangeLostFoundReducer,
  isDeleteLostFoundReducer,
  lostFoundReducer,
  lostFoundsReducer,
  lostFoundStatsReducer,
} from "./reducer";

const status = { status: true };

const cases = [
  ["lostFoundsReducer", lostFoundsReducer, ActionType.SET_LOST_FOUNDS, [], { lostFounds: [{ id: 1 }] }, [{ id: 1 }]],
  ["lostFoundReducer", lostFoundReducer, ActionType.SET_LOST_FOUND, null, { lostFound: { id: 1 } }, { id: 1 }],
  ["lostFoundStatsReducer", lostFoundStatsReducer, ActionType.SET_LOST_FOUND_STATS, null, { stats: { a: 1 } }, { a: 1 }],
  ["isAddLostFoundReducer", isAddLostFoundReducer, ActionType.SET_IS_ADD_LOST_FOUND, false, status, true],
  ["isChangeLostFoundReducer", isChangeLostFoundReducer, ActionType.SET_IS_CHANGE_LOST_FOUND, false, status, true],
  ["isChangeCoverLostFoundReducer", isChangeCoverLostFoundReducer, ActionType.SET_IS_CHANGE_COVER_LOST_FOUND, false, status, true],
  ["isDeleteLostFoundReducer", isDeleteLostFoundReducer, ActionType.SET_IS_DELETE_LOST_FOUND, false, status, true],
];

describe.each(cases)("%s", (_name, reducer, type, initial, payload, expected) => {
  it("memiliki nilai awal yang benar", () => {
    expect(reducer()).toEqual(initial);
  });

  it("mengubah nilai sesuai payload", () => {
    expect(reducer(initial, { type, payload })).toEqual(expected);
  });

  it("mengabaikan aksi yang tidak dikenal", () => {
    expect(reducer(expected, { type: "AKSI_LAIN" })).toBe(expected);
  });
});