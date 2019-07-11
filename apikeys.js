'use strict';
const modelChoicesActivity = {
    add_question: {
        id: "isak_add_question_id",
        points: "isak_add_question_points"
    },
    add_solution: {
        id: 3,
        base_points: 20,
        points: 20,
        live_question: {
            within_minutes: 15,
            within_minutes_points: 200,
            after_minutes_points: 100
        }
    },
};

const modelChoicesSurge = {
    multipliers: [{
        multiplier: "ak_0_i_multiplier",
        stepUpAt: "ak_0_i_stepUpAt"
    }, {
        multiplier: "ak_1_i_multiplier",
        stepUpAt: "ak_1_i_stepUpAt",
        stepDownAt: "ak_1_i_stepDownAt"
    }, {
        multiplier: "ak_2_i_multiplier",
        stepUpAt: "ak_2_i_stepUpAt",
        stepDownAt: "ak_2_i_stepDownAt"
    }, {
        multiplier: "ak_3_i_multiplier",
        stepDownAt: "ak_3_i_stepDownAt"
    }],
    currentMultiplier: 1,
    estimatedLiveFeedSize: 0
};

const modelChoicesCouponType = {
    coupon50: {
        id: 1,
        isFixed: false,
        avgMin: 3,
        avgMax: 6,
        minAmount: 5,
        maxAmount: 30
    },
    coupon250: {
        id: 2,
        isFixed: true,
        maxAmount: 100
    },
    coupon500: {
        id: 3,
        isFixed: true,
        maxAmount: 500
    },
    coupon1000: {
        id: 4,
        isFixed: true,
        maxAmount: 1000
    }
};

const modelChoicesRewardSource = {
    rank_reward: {
        id: 1
    },
    activity_reward: {
        id: 2
    }
};

const modelChoicesLeaderboard = {
    size: 100,
    topWinners: 3
};

const modelChoicesLiveQuestions = {
    liveDurationInMinutes: 30,
    perUserAnswersWindowInMinutes: 60,
    perUserAnswersLimit: 2,
    reportsLimit: 3,
    reportsLimitAdmin: 1
};

const modelChoicesPagination = {
    pageLimit: 20
};

const modelChoicesApiLimits = {
    unratedQuestions: 5
};

const modelChoicesSolutionApproval = {
    rejectSolutionBelowOrEqualLimit: 3
};

const modelChoicesNotificationType = {
    questionPosted: 1,
    solutionPosted: 2,
    questionReported: 3,
    surgeRunning: 4
};

const modelChoicesNotification =  {
    startTime: 4,
    endTime: 16,
    intervalInHours: 2,
    activeUsersLastLoginDays: 10
};

module.exports.modelChoicesActivity = Object.freeze(modelChoicesActivity);
module.exports.modelChoicesSurge = Object.freeze(modelChoicesSurge);
module.exports.modelChoicesCouponType = Object.freeze(modelChoicesCouponType);
module.exports.modelChoicesRewardSource = Object.freeze(modelChoicesRewardSource);
module.exports.modelChoicesLeaderboard = Object.freeze(modelChoicesLeaderboard);
module.exports.modelChoicesLiveQuestions = Object.freeze(modelChoicesLiveQuestions);
module.exports.modelChoicesPagination = Object.freeze(modelChoicesPagination);
module.exports.modelChoicesNotificationType = Object.freeze(modelChoicesNotificationType);
module.exports.modelChoicesSolutionApproval = Object.freeze(modelChoicesSolutionApproval);
module.exports.modelChoicesNotification = Object.freeze(modelChoicesNotification);
module.exports.modelChoicesApiLimits = Object.freeze(modelChoicesApiLimits);