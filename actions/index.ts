import { DEBUGGER_CLICK, DETACH_DEBUGGER, OPEN_NEW_TAB, RUN_ACTIONS } from "./config";
import {  handelOpenNewTab, handleDetachBugger, handleRunActions, simulateClickWithDebugger } from "./events";

export const ACTICON_MAP = {
		[RUN_ACTIONS]: handleRunActions,
		[OPEN_NEW_TAB]: handelOpenNewTab,
		[DETACH_DEBUGGER]: handleDetachBugger,
		[DEBUGGER_CLICK]: simulateClickWithDebugger

}