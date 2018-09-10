/* global m */

(function() {
	document.addEventListener("DOMContentLoaded", function () {
		const Search = {
			value: "",
			submit (Event) {
				let value = this.value;
				if (!value) return;

				if (Event.keyCode === 13) {
					this.value = "";
					console.log(value);
				}
			},
			view () {
				return m("p.control.is-expanded", [
					m("input.input", {
						type: "text",
						placeholder: "Search for an author or title and hit enter",
						onkeydown: this.submit,
						value: this.value
					})
				]);
			}
		};
		const App = {
			controller() {
				return {
					value: "test"
				};
			},
			view(controller) {
				console.log(controller);
				return m("section.hero.is-dark.is-fullheight", [
					m(".hero-head", m(".container", [m(Search)])),
					m(".hero-body", controller.value)
				]);
			}
		};

		m.render(document.body, m(App));
	});
})();