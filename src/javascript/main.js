const url = "https://linush.com/arkiv/dt173g/moment5_server/api.php";
window.onload = getData(); // Onload, fyll table med data

function getData() {
    fetch(url, {
        method: 'GET',
        mode: 'cors'
    })
    .then(status) // Kolla om status är okej
    .then(response => response.json()) // Konvertera
    .then(response => {
    
        var table = document.getElementById("coursesbody");
        //console.log(response);

        response.forEach(row => {
            var newrow = table.insertRow(0); // Skapa en ny rad

            var cell1 = newrow.insertCell(0); // Och 5 nya celler
            var cell2 = newrow.insertCell(1);
            var cell3 = newrow.insertCell(2);
            var cell4 = newrow.insertCell(3);
            var cell5 = newrow.insertCell(4);

            // Maybe make this into a edit-button instead
            cell1.contentEditable = "true";
            cell2.contentEditable = "true";
            cell3.contentEditable = "true";

            cell1.className = 'kurskod';
            cell2.className = 'kursnamn';
            cell3.className = "progression";
            cell4.className = 'link';
            cell5.className = 'link';

            cell1.innerHTML = row["code"]; // Tryck in data i dessa 5 celler
            cell2.innerHTML = row["name"];
            cell3.innerHTML = row["progression"];
            cell4.innerHTML = `<a href='${row['syllabus']}'>Kursplan</a>`;
            cell5.innerHTML = `<a href='#' onclick='deleteCourse("${row['code']}")'><img src="assets/delete.svg" alt="Ta bort"></a>`;
        });
    }
    ).then(function() {
        trackCells();
        trackOff(); // Tracka om celler redigeras nu efter att de har skapats
    } 
    ).catch(function(error) {
        console.log('Error: ' + error);
    });;
}

function reload() {
    var tbody = document.getElementById("coursesbody");
    tbody.innerHTML = "";
    getData();
}

var currentelement;

function trackCells() {
    const cells = document.querySelectorAll("td:not(.link)");
    cells.forEach(element => element.addEventListener("click", function() {
        currentelement = element.innerHTML;
    }));
}

function trackOff() { // Trackar om en cell förlorat fokus
    var cells = document.querySelectorAll("td:not(.link)");
    cells.forEach(element => element.addEventListener("blur", function() {
        console.log(this.innerHTML + " has been blurred");

        if (currentelement !== this.innerHTML) { // Om innehållet har ändrats: Uppdatera DB
            var what = element.className; // Klassnamn är vilken typ av kolumn det är
            var parent = element.parentElement; // Hittar parent av elementet klickat på
            var index = parent.firstChild.innerHTML; // Hittar första elementet av parent, alltså kurskoden som är index
    
            updateOne(index, what, this.innerHTML);
        }
    }));
}


function updateOne(index, what, newdata) {
    var senddata = {
        'index': index, // vilken rad, alltså code som är index
        'what': what, // vilken kolumn ska vi ändra på
        'newvalue': newdata // det nya värdet
    }

    fetch(url, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(senddata)
    })
    .then(status)
    .then(response => {
        console.log('Updated in DB!');

    }).catch(function(error) {
        console.log('Error: ' + error);
    });
}


function deleteCourse(data) {
    var senddata = {
        'code': data
    }
    var res = confirm("Är du säker på att du vill ta bort kursen?");

    if (res === true) {
        fetch(url, {
            method: 'DELETE',
            mode: 'cors',
            body: JSON.stringify(senddata)
        })
        .then(status)
        .then(response => {
            //console.log(response);
            reload();
        }).catch(function(error) {
            console.log('Error: ' + error);
        });
    }
}

const myForm = document.getElementById("form");
myForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addCourse();
});

function addCourse() {
    const form = new FormData(myForm);

    fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: form
    })
    .then(status)
    .then(response => {
        //console.log(response);
        
        if (response.ok === true) {
            reload();
            myForm.reset();
        } else {
            alert(response);
        }

    }).catch(function(error) {
        console.log('Error: ' + error);
        reload();
    });

}


// Tagen från https://developers.google.com/web/updates/2015/03/introduction-to-fetch
function status(response) {
    //console.log(response.status);
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
}