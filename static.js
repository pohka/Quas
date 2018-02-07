class Card extends Comp{constructor(props){super(props)
this.name=props.text
this.listItems=["item 1","item 2","item 3"];this.data=[["row 1 col 1","row 1 col 2"],["row 2 col 1","row 2 col 2"],["row 3 col 1","row 3 col 2"]];this.headings=["heading 1","heading 2"];this.count=0;this.active=false;let a=["item 1",Card.test()];console.log(a);}click(e,comp){comp.active=true;comp.count++;Quas.rerender(comp);}leave(e,comp){comp.name="goodbye";Quas.rerender(comp);console.log(comp.el);}static test(str){return 	["div",{"q-test-abc":"xyz"},["testing, "+str+""
]];}render(){let a=this.test;return 	["div",{"id":"card","class":"abc"
,"onclick":this.click,"onmouseleave":this.leave
,"active":this.active},["hello "+this.name+", count: "+this.count+" ",["div",{},["inner ",["div",{"id":"deeper"},["deeper"
]]]],["div",{"class":"inner2"},[["ul",{"q-foreach-li":this.listItems},[]]]],["table",{"q-foreach-tr-td":this.data},[["tr",{"q-foreach-th":this.headings},[]]]],Card.test("123"),]];}}function start(){let c=new Card({text:"world"});let target=document.getElementById("root")
Quas.render(c,"#root");}Quas.customAttrs["test"]= function(parent,params,data){let child=document.createElement("br");parent.appendChild(child);let text=document.createTextNode(data);parent.appendChild(text);}
if(typeof start==='function'){start();}
