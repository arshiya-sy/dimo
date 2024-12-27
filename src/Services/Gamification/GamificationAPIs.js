import axios from "axios";

import Log from "../Log";
import Globals from "../Config/config"
import GeneralUtilities from "../GeneralUtilities";
import androidApiCalls from "../androidApiCallsService";
import GamificationService from "./GamificationService";
import { PRIZE_TYPE_COUPON } from "./GamificationTerms";
import ImportantDetails from "../../WalletComponents/NewLaunchComponents/ImportantDetails";

function GamificationAPIs() {

    this.commonAPIHeaders = {'Content-Type': 'application/json'};
    this.serialNumber = androidApiCalls.getBarcode();

    this.fetchProgramSnapshotListAPI = async () => {
        var userSnapShot = [];
        var syncTime = "";

        // Gamification: User snapshot
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('programSnapshot'),
                data: { userId: ImportantDetails.clientKey },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get user snapshot " + JSON.stringify(response));
                } else {
                    if (GeneralUtilities.isNotEmpty(response?.data?.data, false)) {
                        userSnapShot = response.data.data;
                        userSnapShot = GamificationService.formatGamificationTaskJson(userSnapShot);
                    }
                    syncTime = response?.data?.syncTimestamp;
                }
            }).catch(err => {
                Log.sError("Error: Not able to get user snapshot gamification data: " + err);
            }).finally(() => {
                //set snapshot data in prefs
                let previousSnapshotData = androidApiCalls.getDAStringPrefs("GPSnapshotData");
                androidApiCalls.setDAStringPrefs("PreGPSnapshotData", previousSnapshotData);
                androidApiCalls.setDAStringPrefs("GPSnapshotData", JSON.stringify(userSnapShot));

                //set sync time in prefs
                let preSyncTime = androidApiCalls.getDAStringPrefs("GPSnapshotSyncTime");
                androidApiCalls.setDAStringPrefs("PreGPSnapshotSyncTime", preSyncTime);
                androidApiCalls.setDAStringPrefs("GPSnapshotSyncTime", syncTime);
                resolve(userSnapShot);
            });
        });
    }

    this.fetchUserProgramsListAPI = async () => {
        let userProgramsList = [];

        // Gamification: User Programs List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('ongoingPrograms'),
                data: { userId: ImportantDetails.clientKey, serialNumber: this.serialNumber },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get program " + JSON.stringify(response));
                } else {
                    userProgramsList = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                    userProgramsList = GamificationService.formatGamificationTaskJson(userProgramsList);
                }
            }).catch(err => {
                Log.sError("Error: Not able to get gamification data: " + err);
            }).finally(() => {
                resolve(userProgramsList);
            });
        });
    }

    this.fetchAllPrizesListAPI = async () => {
        var userEarnedPrizesData = [];

        // Gamification: All Prizes List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('allPrizes'),
                data: { userId: ImportantDetails.clientKey, serialNumber: this.serialNumber },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get all rewards " + JSON.stringify(response));
                } else {
                    userEarnedPrizesData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get all rewards gamification data: " + err);
            }).finally(() => {
                resolve(userEarnedPrizesData);
            });
        });
    }

    this.fetchWonProgramsListAPI = async () => {
        var wonProgramsData = [];

        // Gamification: Won Program List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('wonRewards'),
                data: { userId: ImportantDetails.clientKey, serialNumber: this.serialNumber },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get won programs list " + JSON.stringify(response));
                } else {
                    wonProgramsData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get won programs gamification data: " + err);
            }).finally(() => {
                resolve(wonProgramsData);
            });
        });
    }

    this.fetchUserEarnedLuckyNumbersListAPI = async (programId, drawStartDate, drawEndDate) => {
        var userEarnedLuckyNumbersData = [];

        // Gamification: User Earned Lucky Numbers List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('programLuckyNumbers'),
                data: { userId: ImportantDetails.clientKey, programId, drawStartDate, drawEndDate },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get user earned lucky numbers " + JSON.stringify(response));
                } else {
                    userEarnedLuckyNumbersData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get user earned lucky numbers gamification data: " + err);
            }).finally(() => {
                resolve(userEarnedLuckyNumbersData);
            });
        });
    }

    this.fetchUserEarnedCouponsListAPI = async (programId, startDate, endDate) => {
        var userEarnedCouponsData = [];

        // Gamification: User Earned Coupons List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('programCoupons'),
                data: { userId: ImportantDetails.clientKey, programId, startDate, endDate },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get user earned coupons " + JSON.stringify(response));
                } else {
                    userEarnedCouponsData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get user earned coupons gamification data: " + err);
            }).finally(() => {
                resolve(userEarnedCouponsData);
            });
        });
    }

    this.revealUserEarnedCouponAPI = async (rewardId) => {
        var userEarnedCouponData = {};

        // Gamification: Reveal User Earned Coupon
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('revealCoupon'),
                data: { rewardId },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to reveal user earned coupon " + JSON.stringify(response));
                } else {
                    userEarnedCouponData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : {};
                }
            }).catch(err => {
                Log.sError("Error: Not able to reveal user earned coupon gamification data: " + err);
            }).finally(() => {
                resolve(userEarnedCouponData);
            });
        });
    }

    this.fetchProgramHistoryListAPI = async (programId) => {
        var programHistoryData = [];

        // Gamification: Program History List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('programHistory'),
                data: { userId: ImportantDetails.clientKey, programId },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get program history data " + JSON.stringify(response));
                } else {
                    programHistoryData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get program history data: " + err);
            }).finally(() => {
                resolve(programHistoryData);
            });
        });
    }
    
    this.fetchCompletedProgramsListAPI = async () => {
        var completedProgramsList = [];

        // Gamification: Completed Programs List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('completedPrograms'),
                data: { userId: ImportantDetails.clientKey, serialNumber: this.serialNumber },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get completed programs list " + JSON.stringify(response));
                } else {
                    completedProgramsList = GamificationService.formatCompletedProgramJson(response?.data?.data);
                }
            }).catch(err => {
                Log.sError("Error: Not able to get completed programs list: " + err);
            }).finally(() => {
                resolve(completedProgramsList);
            });
        });
    }

    this.fetchUserRewardParticipationAPI = async (programId, rewardType) => {
        var userRewardParticipationData = {};
        const apiUrlKey = rewardType === PRIZE_TYPE_COUPON ? "userCouponParticipation" : "userLNParticipation";

        // Gamification: Reward Summary Data
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl(apiUrlKey),
                data: { userId: ImportantDetails.clientKey, programId },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError(`Error: response !== 200, Not able to get user reward participation data: ${JSON.stringify(response)}`);
                } else {
                    userRewardParticipationData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(error => {
                Log.sError(`Error: Not able to get user reward participation data: ${error.message}`);
            }).finally(() => {
                resolve(userRewardParticipationData);
            });
        });
    }

    this.fetchCompletedDrawHistoryListAPI = async (programId) => {
        var completedDrawHistoryList = [];

        // Gamification: Completed Program Draw History List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('completedDrawHistory'),
                data: { userId: ImportantDetails.clientKey, programId },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get completed program draw history list " + JSON.stringify(response));
                } else {
                    completedDrawHistoryList = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get completed program draw history list: " + err);
            }).finally(() => {
                resolve(completedDrawHistoryList);
            });
        });
    }

    this.fetchCompletedProgramTasksAPI = async (programId) => {
        var completedProgramTasks = [];

        // Gamification: Tasks Overview List
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl('completedProgramTasks'),
                data: { userId: ImportantDetails.clientKey, serialNumber: this.serialNumber, programId },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError("Error: response !== 200, Not able to get completed program tasks list " + JSON.stringify(response));
                } else {
                    completedProgramTasks = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(err => {
                Log.sError("Error: Not able to get completed program tasks list: " + err);
            }).finally(() => {
                resolve(completedProgramTasks);
            });
        });
    }

    this.fetchAchievementBoardAPI = async (programId, rewardType) => {
        var achievementBoardData = {};
        const apiUrlKey = rewardType === PRIZE_TYPE_COUPON ? "couponAchievementBoard" : "LNAchievementBoard";

        // Gamification: Achievement Board Data
        return await new Promise((resolve) => {
            axios.create({}).request({
                method: 'post',
                url: Globals.getGamificationApiUrl(apiUrlKey),
                data: { userId: ImportantDetails.clientKey, programId },
                headers: this.commonAPIHeaders
            }).then((response) => {
                if (response.status !== 200) {
                    Log.sError(`Error: response !== 200, Not able to get achievement board data: ${JSON.stringify(response)}`);
                } else {
                    achievementBoardData = GeneralUtilities.isNotEmpty(response?.data?.data, false) ? response?.data?.data : [];
                }
            }).catch(error => {
                Log.sError(`Error: Not able to get achievement board data: ${error.message}`);
            }).finally(() => {
                resolve(achievementBoardData);
            });
        });
    }
}

export default new GamificationAPIs();