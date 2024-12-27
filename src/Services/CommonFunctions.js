import history from "./../history";
import PageState from "./PageState";
import constantObjects from "./Constants";
import MetricsService from "./MetricsService";
import GeneralUtilities from "./GeneralUtilities";
import ChatBotUtils from "../WalletComponents/NewUserProfileComponents/ChatComponents/ChatBotUtils";

export default class CommonFunctions {
    static addVisibilityEventListener = (componentName) => document.addEventListener("visibilitychange", () => this.onVisibilityChange(componentName));
    
    static removeVisibilityEventListener = (componentName) => document.removeEventListener("visibilitychange", () => this.onVisibilityChange(componentName));
    
    static onVisibilityChange = (componentName) => {
        const visibilityState = document.visibilityState;

        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(componentName);
        }
    }

    static onHelpButtonPressed = (componentName) => {
        GeneralUtilities.sendActionMetrics(componentName, constantObjects.open_help_page);
        GeneralUtilities.openHelpSection();
    }

    static onChatBotButtonPressed = (fromComponent) => {
        ChatBotUtils.insideChatBot(fromComponent);
        history.replace({ pathname: "/chat", transition: "right" });
    }

    static sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        
        MetricsService.reportActionMetrics(event, new Date().getTime());
    }
}