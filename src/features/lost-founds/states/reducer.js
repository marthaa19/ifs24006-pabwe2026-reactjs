import { ActionType } from "./action";

export function lostFoundsReducer(lostFounds = [], action = {}) {
  switch (action.type) {
    case ActionType.SET_LOST_FOUNDS:
      return action.payload.lostFounds;
    default:
      return lostFounds;
  }
}

export function lostFoundReducer(lostFound = null, action = {}) {
  switch (action.type) {
    case ActionType.SET_LOST_FOUND:
      return action.payload.lostFound;
    default:
      return lostFound;
  }
}

export function lostFoundStatsReducer(lostFoundStats = null, action = {}) {
  switch (action.type) {
    case ActionType.SET_LOST_FOUND_STATS:
      return action.payload.stats;
    default:
      return lostFoundStats;
  }
}

export function isAddLostFoundReducer(isAddLostFound = false, action = {}) {
  switch (action.type) {
    case ActionType.SET_IS_ADD_LOST_FOUND:
      return action.payload.status;
    default:
      return isAddLostFound;
  }
}

export function isChangeLostFoundReducer(
  isChangeLostFound = false,
  action = {}
) {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_LOST_FOUND:
      return action.payload.status;
    default:
      return isChangeLostFound;
  }
}

export function isChangeCoverLostFoundReducer(
  isChangeCoverLostFound = false,
  action = {}
) {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_COVER_LOST_FOUND:
      return action.payload.status;
    default:
      return isChangeCoverLostFound;
  }
}

export function isDeleteLostFoundReducer(
  isDeleteLostFound = false,
  action = {}
) {
  switch (action.type) {
    case ActionType.SET_IS_DELETE_LOST_FOUND:
      return action.payload.status;
    default:
      return isDeleteLostFound;
  }
}