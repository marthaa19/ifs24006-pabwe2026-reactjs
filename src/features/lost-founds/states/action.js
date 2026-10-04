import lostFoundApi from "../api/lostFoundApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_LOST_FOUNDS: "SET_LOST_FOUNDS",
  SET_LOST_FOUND: "SET_LOST_FOUND",
  SET_LOST_FOUND_STATS: "SET_LOST_FOUND_STATS",
  SET_IS_ADD_LOST_FOUND: "SET_IS_ADD_LOST_FOUND",
  SET_IS_CHANGE_LOST_FOUND: "SET_IS_CHANGE_LOST_FOUND",
  SET_IS_CHANGE_COVER_LOST_FOUND: "SET_IS_CHANGE_COVER_LOST_FOUND",
  SET_IS_DELETE_LOST_FOUND: "SET_IS_DELETE_LOST_FOUND",
};

export function setLostFoundsActionCreator(lostFounds) {
  return { type: ActionType.SET_LOST_FOUNDS, payload: { lostFounds } };
}

export function setLostFoundActionCreator(lostFound) {
  return { type: ActionType.SET_LOST_FOUND, payload: { lostFound } };
}

export function setLostFoundStatsActionCreator(stats) {
  return { type: ActionType.SET_LOST_FOUND_STATS, payload: { stats } };
}

export function setIsAddLostFoundActionCreator(status) {
  return { type: ActionType.SET_IS_ADD_LOST_FOUND, payload: { status } };
}

export function setIsChangeLostFoundActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_LOST_FOUND, payload: { status } };
}

export function setIsChangeCoverLostFoundActionCreator(status) {
  return {
    type: ActionType.SET_IS_CHANGE_COVER_LOST_FOUND,
    payload: { status },
  };
}

export function setIsDeleteLostFoundActionCreator(status) {
  return { type: ActionType.SET_IS_DELETE_LOST_FOUND, payload: { status } };
}

export function asyncSetLostFounds(params) {
  return async (dispatch) => {
    try {
      const { data } = await lostFoundApi.getLostFounds(params);
      dispatch(setLostFoundsActionCreator(data.lost_founds));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetLostFound(id) {
  return async (dispatch) => {
    try {
      const { data } = await lostFoundApi.getLostFoundById(id);
      dispatch(setLostFoundActionCreator(data.lost_found));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetLostFoundStats() {
  return async (dispatch) => {
    try {
      const { data } = await lostFoundApi.getStatsDaily();
      dispatch(setLostFoundStatsActionCreator(data));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetIsAddLostFound(title, description, status) {
  return async (dispatch) => {
    try {
      const { message } = await lostFoundApi.postLostFound(
        title,
        description,
        status
      );
      await showSuccessDialog(message);
      dispatch(setIsAddLostFoundActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsAddLostFoundActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsChangeLostFound(
  id,
  title,
  description,
  status,
  isCompleted
) {
  return async (dispatch) => {
    try {
      const { message } = await lostFoundApi.putLostFound(
        id,
        title,
        description,
        status,
        isCompleted
      );
      await showSuccessDialog(message);
      dispatch(setIsChangeLostFoundActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeLostFoundActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsChangeCoverLostFound(id, file) {
  return async (dispatch) => {
    try {
      const { message } = await lostFoundApi.postLostFoundCover(id, file);
      await showSuccessDialog(message);
      dispatch(setIsChangeCoverLostFoundActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeCoverLostFoundActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsDeleteLostFound(id) {
  return async (dispatch) => {
    const isConfirmed = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus laporan ini?",
      "Hapus"
    );

    if (!isConfirmed) {
      return false;
    }

    try {
      const { message } = await lostFoundApi.deleteLostFound(id);
      await showSuccessDialog(message);
      dispatch(setIsDeleteLostFoundActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsDeleteLostFoundActionCreator(false));
      return false;
    }
  };
}