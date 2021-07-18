import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import { firebaseConfig } from './firebase.config';
import { useState } from 'react';


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}


function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const handleGoogleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then((res) => {
        const { email, photoURL, displayName } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
      }).catch((err) => {
        console.log(err.message)
      });
  }


  var facebookProvider = new firebase.auth.FacebookAuthProvider();
  const handleFacebookSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(facebookProvider)
      .then((res) => {
        const { email, photoURL, displayName } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        console.log('fb sign in', res.user)
        setUser(signedInUser);
      })
      .catch((err) => {
        console.log(err.message)
      });
  }

  const handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      setUser({
        isSignedIn: false,
        name: '',
        email: '',
        photo: '',
        error: '',
        success: false
      })
    }).catch((err) => {
      console.log(err.message)
    });
  }

  const handleInput = (e) => {
    // console.log(e.target.name, e.target.value)
    let isFieldValid = true;
    // validation
    if (e.target.name === 'email') {
      isFieldValid = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      // (// at least one number, one lowercase and one uppercase letter
      // // at least six characters
      // var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;)

      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = passwordHasNumber && isPasswordValid;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user }
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }

  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
          const { email, photoURL, displayName } = res.user;
          const signedInUser = {
            isSignedIn: true,
            name: displayName,
            email: email,
            photo: photoURL
          }
          setUser(signedInUser);
          console.log("signed in successfully", user.email, user.password, user.name)
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          console.log('console error', error.message)
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          const { email, photoURL, displayName } = res.user;
          const signedInUser = {
            isSignedIn: true,
            name: displayName,
            email: email,
            photo: photoURL
          }
          setUser(signedInUser);
          console.log('sign in user info', res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          console.log('console error', error.message)
        });
    }

    e.preventDefault();
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then((res) => {
      console.log('updated username successfully', res.user);
    }).catch((error) => {
      console.log(error.message)
    });
  }



  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleGoogleSignIn}>Google Sign In</button>
      }
      <br />
      <button onClick={handleFacebookSignIn}>Facebook Sign In</button>
      {
        user.isSignedIn && <div>
          <h2>Welcome, {user.name || user.displayName}</h2>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }

      <h2>Custom Authentication</h2>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="newUser" />
      <label htmlFor="newUser">{!newUser ? 'Existing User' : 'New user sign up'}</label>
      <form onClick={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleInput} placeholder="Enter name.." id="a" />}
        <br />
        <input type="text" name="email" onBlur={handleInput} placeholder="Enter email.." required id="b" />
        <br />
        <input type="password" name="password" onBlur={handleInput} placeholder="Enter password.." required id="" />
        <br />
        <input type="submit" value={newUser ? 'Submit' : 'Sign In'} />
      </form>

      {user.error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {user.error}*</p>}
      {user.success && <p style={{ color: 'green', textAlign: 'center' }}>User {newUser ? 'Created' : 'Logged In'} Successfully ✔</p>}
    </div>
  );
}

export default App;
