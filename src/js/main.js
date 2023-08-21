
@import "modules/maps.js";


let blank = "jws,pwe,jwse,pwe,jwse,pwe,jse,pns,b,pns,b,pns,b,pns,jnws,pwe,jnwse,pwe,jnwse,pwe,jnse,pns,b,pns,b,pns,b,pns,jnws,pwe,jnwse,pwe,jnwse,pwe,jnse,pns,b,pns,b,pns,b,pns,jnw;E,pwe,jnwe,pwe,jnwe,pwe,jne";
let all = "jws;X,pwe,jwse;X,bwe,jwse,pwe,jse;X,pns,b,pns,b,pns,b,pns,jnws;X,bwe,jnwse,bwe,jnwse,pwe,jnse,pns,b,pns,b,bns,b,pns,jnws,bwe,jnwse;E,bwe,jnwse,pwe,jnse;X,pns,b,pns,b,pns,b,pns,jnw;X,bwe,jnwe;X,bwe,jnwe,pwe,jne;X";


const windmill = {
	init() {
		// fast references
		this.content = window.find("content");

		Maps.draw(blank);
	},
	dispatch(event) {
		switch (event.type) {
			case "window.init":
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = windmill;
