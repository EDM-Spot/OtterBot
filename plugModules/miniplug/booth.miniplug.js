module.exports = function _boothPlugin (opts) {
  if (typeof opts === "undefined") opts = {};

  const currentBoothState = Symbol("Booth State");

	return (mp) => {
		// Local state API
		const historyEntry = () => mp[currentHistoryEntry];
		const dj = () => mp[currentHistoryEntry] ? mp[currentHistoryEntry].dj : null;
		const media = () => mp[currentHistoryEntry] ? mp[currentHistoryEntry].media : null;

		mp.on("roomState", (state) => {
			mp[currentBoothState] = {
				isLocked: state.booth.isLocked,
				shouldCycle: state.booth.shouldCycle,
				waitingDJs: state.booth.waitingDJs
			};
		});

		// Socket API
		mp.on('login', () => {
			mp.ws.on("djListCycle", (e) => {
				mp[currentBoothState].shouldCycle = e.f;

				var shouldCycle = e.f;
				var shouldClear = e.c;
				var moderatorName = e.m;
				var moderatorID = e.mi;

				mp.emit("waitlistCycle", {
					shouldCycle: shouldCycle,
					shouldClear: shouldClear,
					moderatorUsername: moderatorName,
					moderator: mp.user(moderatorID) || moderatorID
				});
			});
			mp.ws.on("djListLocked", (e) => {
				mp[currentBoothState].isLocked = e.f;

				var isLocked = e.f;
				var moderatorName = e.m;
				var moderatorID = e.mi;

				mp.emit("waitlistLock", {
					isLocked: isLocked,
					moderatorUsername: moderatorName,
					moderator: mp.user(moderatorID) || moderatorID
				});
			});
		});

		Object.assign(mp, {
			booth: () => mp[currentBoothState],
			shouldCycle: () => mp[currentBoothState].shouldCycle,
			isLocked: () => mp[currentBoothState].isLocked
		});
	};
};