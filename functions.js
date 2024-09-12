function removeFamily (button){
	let familyList = $("div.oneFamily");
	if (familyList.length > 2){
		$(button).parent().remove();
		familyList = $("div.oneFamily").not("#firstFamily");
		var id = 1;
		for (let fam of familyList){
			changeName ($(fam), id);
			id++;
		}
	}
	else {
		alert ("חובה להוסיף לפחות משפחה אחת!");
	}
}
function addFamily (){
	let familyList = $("div.oneFamily");
	if (familyList.length >= familiesDetails.names.length){
		alert ("לא ניתן להוסיף משפחות נוספות! ניתן להוסיף אורחים מיוחדים בהמשך.");
	}
	else {
		var newFamily = $("<div></div>").addClass("oneFamily");
		var sectionContent = $("div.oneFamily:last").html();
		newFamily.html(sectionContent);
		var id = parseInt($("div.familyNumber:last").text()) + 1;
		changeName (newFamily, id);
		$("div.oneFamily:last").after(newFamily);
	}
}

function selectFamily (familyList){
	var selector = $("<select></select>").addClass ("familyName FN");
	selector.name = "familyName1";
	for (let family of familyList.names){
		if (family == "חמדי-לוי"){
			continue;
		}
		let newOption = $("<option>משפחת " + family + "</option>");
		selector.append (newOption);
	}
	return selector;
}

function changeName (parentElement, id){
	let num = parentElement.find ("div.familyNumber");
	let children = parentElement.find ("div.familyChildren > input");
	let meals = parentElement.find ("div.meals > input");
	let fname = parentElement.find ("select");
	num.text(id + ".");
	children.attr ("name", "child" + id);
	meals.attr ("name", "meal" + id);
	fname.attr ("name", "familyName" + id);
}

function family(name, members){
	this.name = name;
	this.members = members;
	this.children = function (maxAge = 18){
		var children = [];
		for (let member of this.members){
			if (member.age < maxAge){
				children.push(member);
			}
		}
		return children;
	}
}
function csvLoad(fileName){
	var csvFile = new XMLHttpRequest ();
	familiesDetails = {"names":[]};
	csvFile.onreadystatechange = function (){
		if (this.readyState == 4 && this.status == 200){
			var lines = this.responseText.split ("\n");
			var today = new Date();
			var yearNow = today.getFullYear();
			for (let i = 1; i < lines.length-1;i++){
				let details = lines[i].split(",");
				let name = details[0];
				let familyName = details[1];
				let yearOfBirth = details[2];
				let newMember = {"name":name, "family": familyName, "year": yearOfBirth};
				newMember.age = yearNow - newMember.year;
				if (familiesDetails.names.includes(familyName)){
					familiesDetails[familyName].members.push(newMember);
				}
				else {
					familiesDetails[familyName] = new family(familyName, [newMember]);
					familiesDetails.names.push(familyName);
				}
			}
			$("div.familyNumber:last").after (selectFamily (familiesDetails));
		}
	};
	csvFile.open ("GET", fileName, true);
	csvFile.send();
	return familiesDetails;
}

function next (button){
	$(button).parent().css ("display", "none");
	$(button).parent().next().css ("display", "block");
	scroll (0, 0);
}

function previous (button){
	$(button).parent().css ("display", "none");
	$(button).parent().prev().css ("display", "block");
	scroll (0, 0);
}

function childrenDetails (button){
	var changePage = true;
	let mydiv = $("#children");
	mydiv.html ("");
	invited = [];
	let total = document.getElementsByClassName ("oneFamily").length;
	for (let i = 0; i < total; i++){
		let name = i == 0?$(".familyName").eq(i).text():$(".familyName").eq(i).val();
		name = name.substr(6); // less the word 'משפחת'
		if (invited.filter (function (finvited){ return finvited.name == name; }).length > 0){ // check if a family is already invited
			alert ("משפחת " + name + " מופיעה יותר מפעם אחת!");
			changePage = false;
			break;
		}
		let children = $("[name='child" + i + "']:checked").val();
		let meals = [];
		for (let c of $("[name='meal" + i + "']:checked")){
			meals.push ($(c).val());
		}
		// אין סעודות למשפחה זו
		if (meals.length == 0){
			alert ("חובה לסמן לפחות סעודה אחת בשביל משפחת " + name + "!");
			changePage = false;
			break;
		}
		
		// add new block for the new family invited
		let myBlock = $("<div></div").attr ("class", "invitedFamily");
		// family name
		myBlock.append ($("<div>משפחת " + name + "</div>").attr ("class", "invitedFamilyName"));
		
		// meals of family
		if (meals.length != 4){
			let text = [];
			let dictionary = {"first": "סעודה ראשונה", "second": "סעודה שניה", "third": "סעודה שלישית", "sleep": "לינה"};
			for (let i = 0; i < meals.length; i++){
				text.push (dictionary[meals[i]]);
			}
			myBlock.append ($("<div>" + text.join (", ") + "</div>").attr ("class", "invitedMeals"));
		}
		else {
			myBlock.append ($("<div>כל הסעודות + לינה</div>").attr ("class", "invitedMeals"));
		}
		
		//members of family
		let invitedFamilyMembers = $("<div></div").attr ("class", "familyMembers");
		if (children == "some"){
			for (let member of familiesDetails[name].members){
				invitedFamilyMembers.append ('<div class="member"><input type="checkbox" name="' + name + '" value="' + member.name + '" checked /> ' + member.name + '</div>');
			}
		}
		else {
			for (let member of familiesDetails[name].members){
				invitedFamilyMembers.append ('<div class="member">&#x2713 ' + member.name + '</div>');
			}
		}
		myBlock.append (invitedFamilyMembers);
		mydiv.append(myBlock);
		invited.push ({"name": name, "children": children, "members": familiesDetails[name].members, "meals": meals});
	}
	if (changePage){
		next (button);
	}
	console.log (invited);
}

function addMembers (button){
	let checkedMember = $(".member input:checked");
	for (let fInvited of invited){
		if (fInvited.children == "some"){
			let memNames = [];
			for (let x of checkedMember){
				if (x.name == fInvited.name){
					memNames.push (x.value);
				}
			}
			fInvited.members = fInvited.members.filter (function (item){
				return memNames.includes (item.name);
			});
		}
	}
	next (button);
	console.log (invited);
}

function calculate (button){
	specialInvited = {
		"firstMealAdults":0,
		"firstMealChildren":0,
		"secondMealAdults":0,
		"secondMealChildren":0,
		"thirdMealAdults":0,
		"thirdMealChildren":0,
		"sleepAdults":0,
		"sleepChildren":0,
	};
	let changePage = true;
	for (num of $("#special").find("input")){
		if (num.value != parseInt(num.value)){
			alert ("מספר האורחים חייב להיות מספר שלם!");
			changePage = false;
			break;
		}
		if (num.value < 0){
			alert ("מספר האורחים חייב להיות מספר חיובי!");
			changePage = false;
			break;
		}
		specialInvited[num.name] = parseInt(num.value);
	}
	console.log (specialInvited);
	result = {"first": [0, 0], "second": [0, 0], "third": [0, 0], "sleep": [0, 0]};
	for (let fInvited of invited){
		let children = familiesDetails[fInvited.name].children (3).length;
		let adults = familiesDetails[fInvited.name].members.length - children;
		for (let meal of fInvited.meals){
			result[meal][0] += adults;
			result[meal][1] += children;
		}
	}
	let myTable = $("#table").children();
	myTable[5].textContent = result.first[0] + specialInvited.firstMealAdults;
	myTable[6].textContent = result.first[1] + specialInvited.firstMealChildren;
	myTable[7].textContent = parseInt (myTable[5].textContent) + parseInt (myTable[6].textContent);
	
	myTable[9].textContent = result.second[0] + specialInvited.secondMealAdults;
	myTable[10].textContent = result.second[1] + specialInvited.secondMealChildren;
	myTable[11].textContent = parseInt (myTable[9].textContent) + parseInt (myTable[10].textContent);
	
	myTable[13].textContent = result.third[0] + specialInvited.thirdMealAdults;
	myTable[14].textContent = result.third[1] + specialInvited.thirdMealChildren;
	myTable[15].textContent = parseInt (myTable[13].textContent) + parseInt (myTable[14].textContent);
	
	myTable[17].textContent = result.sleep[0] + specialInvited.sleepAdults;
	myTable[18].textContent = result.sleep[1] + specialInvited.sleepChildren;
	myTable[19].textContent = parseInt (myTable[17].textContent) + parseInt (myTable[18].textContent);
	
	$(".field .data").eq(0).text (Math.max (parseInt (myTable[7].textContent), parseInt (myTable[11].textContent), parseInt (myTable[15].textContent), parseInt (myTable[19].textContent)));
	$(".field .data").eq(1).text (Math.max (parseInt (myTable[6].textContent), parseInt (myTable[10].textContent), parseInt (myTable[14].textContent), parseInt (myTable[18].textContent)));
	if (changePage){
		next (button);
	}
	console.log (result);
}