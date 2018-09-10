const compose = require("compose-function");

module.exports = function _staffPlugin (opts) {
  if (typeof opts === "undefined") opts = {};

	return (mp) => {
		// Local state API
		const staff = () => mp.users().filter(user => user.role);
		const globalStaff = () => mp.users().filter(user => user.gRole >= 2500);

		// Rest API
		const setRole = (id, role) => role ? mp.post("staff/update", {userID: id, roleID: role}) : mp.del(`staff/${id}`);
		const getStaff = () => mp.get("staff");

		// new user method
		const decorateUser = user => {
			return Object.assign(user, {
				setRole: (role) => setRole(user.id, role)
			});
		};

		mp.wrapUser = compose(decorateUser, mp.wrapUser);

		// Public API
		Object.assign(mp, {
			staff,
			globalStaff,
			setRole,
			getStaff
		});
	};
};