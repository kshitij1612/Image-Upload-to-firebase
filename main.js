import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
	
	const firebaseConfig = {
	    apiKey: "AIzaSyBQeaOt-ETzmr5UdWIRe29q35_dsi4iE6g",
        authDomain: "upload-image-to-firebase-11e40.firebaseapp.com",
        databaseURL: "https://upload-image-to-firebase-11e40-default-rtdb.firebaseio.com",
        projectId: "upload-image-to-firebase-11e40",
        storageBucket: "upload-image-to-firebase-11e40.appspot.com",
        messagingSenderId: "371956469356",
        appId: "1:371956469356:web:54bc1616e73fbe5f9b1249"
	};
  
	// Initialize Firebase
	const app = initializeApp(firebaseConfig);

	
    import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL }
	from "https://www.gstatic.com/firebasejs/9.1.3/firebase-storage.js";

    import { getDatabase, ref, set, child, get, update, remove }
    from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
	const realdb = getDatabase();
   
   var files = [];
	var reader = new FileReader();

	var namebox = document.getElementById('namebox');
	var extlab = document.getElementById('extlab');
	var myimg = document.getElementById('myimg');
	var proglab = document.getElementById('upprogress');
	var SelBtn = document.getElementById('selbtn');
	var UpBtn = document.getElementById('upbtn');
	var DownBtn = document.getElementById('downbtn');

	var input = document.createElement('input');
	input.type = 'file';

	input.onchange = e =>{
		files = e.target.files;

		var extention = GetExtName(files[0]);
		var name = GetFileName(files[0]);

		namebox.value = name;
		extlab.innerHTML = extention;

		reader.readAsDataURL(files[0]);
	}

	reader.onload = function() {
		myimg.src = reader.result;
	}

	SelBtn.onclick = function(){
		input.click();
	}

	function GetExtName(file) {
		var temp = file.name.split('.');
		var ext = temp.slice((temp.length-1),(temp.length));
		return '.' + ext[0];
	}

	function GetFileName(file) {
		var temp = file.name.split('.');
		var fname = temp.slice(0,-1).join('.');
		return fname;
	}

    async function UploadProcess() {
        var ImgToUpload = files[0];

        var ImgName = namebox.value + extlab.innerHTML;

		if(!ValidateName()){
			alert('name cannot contain ".", "#", "$", "[", "]"')
			return;
		}

        const metaData = {
            contentType: ImgToUpload.type
        }

        const storage = getStorage();

        const storageRef = sRef(storage, "Images/"+ImgName);

        const UploadTask = uploadBytesResumable(storageRef, ImgToUpload, metaData);

        UploadTask.on('state-changed', (snapshot)=>{
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            proglab.innerHTML = "Upload"+ progress + "%";
        },
        (error) =>{
            alert("error: image not uploaded!");
        },

        ()=>{
            getDownloadURL(UploadTask.snapshot.ref).then((downloadURL)=>{
                SaveURLtoRealtimDB(downloadURL);
            });
        }
        );
    }

	function SaveURLtoRealtimDB(URL) {
		console.log("SaveURLtoRealtimDB");
		var name = namebox.value;
		var ext = extlab.innerHTML;

		set(ref(realdb,"ImagesLinks/"+name),{
			ImageName: (name+ext),
			ImgUrl: URL
		});
	}

	function GetUrlfromRealtimDB(URL) {
		var name = namebox.value;
		
        var dbRef = ref(realdb);

		get(child(dbRef, "ImagesLinks/"+name)).then((snapshot)=>{
			if(snapshot.exists()){
				myimg.src = snapshot.val().ImgUrl;
			}
		})
	}

	function ValidateName(){
		var regex = /[\.#$\[\]]/
		return !(regex.test(namebox.value));
	}

    UpBtn.onclick = UploadProcess;
	DownBtn.onclick = GetUrlfromRealtimDB;
