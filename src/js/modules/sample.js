
let lvl = {};

lvl["level1a-H"] = "[2x0]"+
	"jw;E,pwe,jwe,pwe,je";
lvl["level1b-H"] = "[2x0]"+
	"jw,pwe,jwe,pwe,jwe;E";
lvl["level1a-V"] = "[0x2]"+
	"js;E,pns,jns,pns,jn";
lvl["level1b-V"] = "[0x2]"+
	"js,pns,jns,pns,jns;E";

lvl["all"] = "[3x3]"+
	"jws;X,pwe,jwse;X,bwe,jwse,pwe,jse;X,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnws;X,bwe,jnwse,bwe,jnwse,pwe,jnse,"+
	"pns,b,pns,b,bns,b,pns,"+
	"jnws,bwe,jnwse;E,bwe,jnwse,pwe,jnse;X,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnw;X,bwe,jnwe;X,bwe,jnwe,pwe,jne;X";


lvl["large"] = "[5x3]"+
	"jws,pwe,jwse,pwe,jwse,pwe,jwse,pwe,jwse,pwe,jse,"+
	"pns,b,pns;e,b,pns,b,pns,b,pns,b,pns,"+
	"jnws,bwe,jwse,pwe,jnwse;E,pwe,jnwse,bwe,jnwse,pwe,jnse,"+
	"pns,b,pns,b,pns,b,pns,b,pns;e,b,pns,"+
	"jnws,pwe,jnwe,bwe,jnwse,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b,pns;e,b,bns,b,pns,b,pns,b,pns,"+
	"jnw;E,pwe;e,jne;e,pwe;e,jnw,pwe,jne,pwe;e,jnw,pwe,jne";


lvl["blank"] = "[3x3]"+
	"jws,pwe,jwse,pwe,jwse,pwe,jse,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnws,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnws,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnw;E,pwe,jnwe,pwe,jnwe,pwe,jne";

lvl["stars"] = "[3x3]"+
	"jws,pwe,jwse,pwe,jwse,pwe,jse,"+
	"pns,b;Sb,pns,b;Sr,pns,b;Sn,pns,"+
	"jnws,pwe;h,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b,pns;h,b,pns,b,pns,"+
	"jnws,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnw;E,pwe,jnwe,pwe,jnwe,pwe,jne";

lvl["exits"] = "[3x3]"+
	"jws;X,pwe,jwse;X,pwe,jwse,pwe,jse;X,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnws;X,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnws,pwe,jnwse,pwe,jnwse,pwe,jnse;X,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnw;E,pwe,jnwe;X,pwe,jnwe,pwe,jne;X";

lvl["plus"] = "[3x3]"+
	"jws;e,pwe;e,jws,pwe,jse,pwe;e,jse;e,"+
	"pns;e,b,pns,b,pns,b,pns;e,"+
	"jws,pwe,jnwse,pwe,jnwse,pwe,jse,"+
	"pns,b,pns,b,pns,b,pns,"+
	"jnw,pwe,jnwse,pwe,jnwse,pwe,jne,"+
	"pns;e,b,pns,b,pns,b,pns;e,"+
	"jnw;e,pwe;e,jnwe;E,pwe,jne;X,pwe;e,jne;e";

lvl["plus-x"] = "[3x3]"+
	"jws;e,pwe;e,js;Xe,pwe;e,js;Xw,pwe;e,jse;e,"+
	"pns;e,b,pns,b,pns,b,pns;e,"+
	"jw;Xn,pwe,jnwse;E,pwe,jnwse,bwe,je;Xn,"+
	"pns;e,b,pns,b,pns,b,pns;e,"+
	"jws;e,pwe;e,jnws,pwe,jnwse,bwe,je;Xs,"+
	"pns;e,b,pns,b,pns,b,pns;e,"+
	"jw;X,pwe,jne,pwe;e,jn;Xw,pwe;e,jne;e";

lvl["enigmeto"] = "[4x4]"+
	"jws;X,pwe,jwse,pwe,jwse,pwe,jwse,pwe,jse;X,"+
	"pns,b,pns,b;Db,pns,b;Db,pns,b,pns,"+
	"jnws,pwe,jnwse,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b;Db,pns,b;Do,pns,b;Db,pns,b;Do,pns,"+
	"jnws;E,pwe,jnwse,pwe,jnwse,pwe,jnwse,pwe,jnse;E,"+
	"pns,b;Do,pns,b;Do,pns,b;Db,pns,b,pns,"+
	"jnws,pwe,jnwse,pwe,jnwse,pwe,jnwse,pwe,jnse,"+
	"pns,b;Db,pns,b;Do,pns,b;Db,pns,b;Do,pns,"+
	"jnw;X,pwe,jnwe,pwe,jnwe,pwe,jnwe,pwe,jne;X";

