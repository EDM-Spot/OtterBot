module.exports = function _boothPlugin(opts) {
  if (typeof opts === "undefined") opts = {};

  const currentBoothState = Symbol("Booth State");

  return (mp) => {
    mp[currentBoothState] = {
      isLocked: false,
      shouldCycle: true,
      waitingDJs: [],
    };

    mp.on("roomState", (state) => {
      mp[currentBoothState] = {
        isLocked: state.booth.isLocked,
        shouldCycle: state.booth.shouldCycle,
        waitingDJs: state.booth.waitingDJs,
      };
    });

    mp.on("connected", () => {
      mp.ws.on("djListCycle", (e) => {
        mp[currentBoothState].shouldCycle = e.f;

        const shouldCycle = e.f;
        const shouldClear = e.c;
        const moderatorName = e.m;
        const moderatorID = e.mi;

        mp.emit("waitlistCycle", {
          shouldCycle,
          shouldClear,
          moderatorUsername: moderatorName,
          moderator: mp.user(moderatorID) || moderatorID,
        });
      });
      mp.ws.on("djListLocked", (e) => {
        mp[currentBoothState].isLocked = e.f;

        const isLocked = e.f;
        const moderatorName = e.m;
        const moderatorID = e.mi;

        mp.emit("waitlistLock", {
          isLocked,
          moderatorUsername: moderatorName,
          moderator: mp.user(moderatorID) || moderatorID,
        });
      });
    });

    Object.assign(mp, {
      booth: () => mp[currentBoothState],
      shouldCycle: () => mp[currentBoothState].shouldCycle,
      isLocked: () => mp[currentBoothState].isLocked,
    });
  };
};