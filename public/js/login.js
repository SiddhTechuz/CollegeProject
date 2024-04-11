const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--signup')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const taskForm = document.querySelector('.form--task')
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};


const login = async (email, password) => {
  try {
    const res = await axios('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)
  })
}
const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout)
}

const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])


    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateSettings(form, 'data');
  })
}
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });



const signUp = async (name, email, password, passwordConfirm) => {

  try {
    const res = await axios('http://localhost:3000/api/v1/users/signup', {
      method: 'POST',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }

    })
    if (res.data.status === 'success') {
      showAlert('success', 'Signed  up successfully!');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }

  }
  catch (err) {
    showAlert('error', err.response.data.message);
  }

}
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirmPassword').value;
    signUp
      (name, email, password, passwordConfirm)
  })
}

const deleteUserFront = async (userId) => {
  console.log(userId);
  try {
    const res = await axios(`http://localhost:3000/api/v1/users/${userId}`, {
      method: 'DELETE',
    })
    if (res.data.status === 'success') {
      showAlert('success', 'Deleted  user successfully!');
    }
  }
  catch (err) {
    showAlert('error', err.response.data.message);
  }
}
const deleteReviewFront = async (reviewId) => {
  console.log(reviewId);
  try {
    const res = await axios(`http://localhost:3000/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
    })
    if (res.data.status === 'success') {
      showAlert('success', 'Deleted  user successfully!');
    }
  }
  catch (err) {
    showAlert('error', err.response.data.message);
  }
}

