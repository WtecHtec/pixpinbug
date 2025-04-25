import { OPEN_NEW_TAB, RUN_ACTIONS } from "./config";
import {  handelOpenNewTab, handleRunActions } from "./events";

export const ACTICON_MAP = {
		[RUN_ACTIONS]: handleRunActions,
		[OPEN_NEW_TAB]: handelOpenNewTab,
}