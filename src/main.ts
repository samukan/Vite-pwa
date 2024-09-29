/// <reference types="vite-plugin-pwa/client" />

import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, UpdateUser, User} from './interfaces/User';
import {apiUrl, uploadUrl} from './variables';
import {registerSW} from 'virtual:pwa-register';

// PWA code
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  },
});

// select forms from the DOM
const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM
const usernameInput = document.querySelector('#username') as HTMLInputElement;
const passwordInput = document.querySelector('#password') as HTMLInputElement;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement;

const avatarInput = document.querySelector('#avatar') as HTMLInputElement;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector('#avatar-target');

// function to login
const login = async (): Promise<LoginUser> => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  const loginData = {
    username: username,
    password: password,
  };

  try {
    const response = await fetchData<LoginUser>(
      `${apiUrl}/auth/login`,
      'POST',
      loginData
    );

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  try {
    const response = await fetchData<UpdateResult>(
      `${apiUrl}/users`,
      'PUT',
      user,
      token
    );

    return response;
  } catch (error) {
    console.error('Update user data failed:', error);
    throw error;
  }
};

// function to add userdata to the DOM and forms
const addUserDataToDom = (user: User): void => {
  if (usernameTarget) {
    usernameTarget.textContent = user.username;
  }

  if (emailTarget) {
    emailTarget.textContent = user.email;
  }

  if (avatarTarget) {
    const avatarElement = avatarTarget as HTMLImageElement;
    if (user.avatar) {
      avatarElement.src = `${uploadUrl}/${user.avatar}`;
    } else {
      avatarElement.src = 'default-avatar.png';
    }
  }

  if (profileUsernameInput) {
    profileUsernameInput.value = user.username;
  }
  if (profileEmailInput) {
    profileEmailInput.value = user.email;
  }
};

// function to get user data
const getUserData = async (token: string): Promise<User> => {
  try {
    const response = await fetchData<User>(
      `${apiUrl}/users/token`,
      'GET',
      undefined,
      token
    );

    return response;
  } catch (error) {
    console.error('Get user data failed:', error);
    throw error;
  }
};

// function to check token and update DOM
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const user = await getUserData(token);
      addUserDataToDom(user);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  } else {
    console.log('No token found in local storage.');
  }
};

// call checkToken on page load
checkToken();

// login form event listener
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const loginResponse = await login();

      if (loginResponse.token) {
        localStorage.setItem('token', loginResponse.token);

        // Use user data from login response
        const user = loginResponse.data;

        addUserDataToDom(user);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  });
}

// profile form event listener
if (profileForm) {
  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    if (token) {
      const updatedUserData: UpdateUser = {
        username: profileUsernameInput.value,
        email: profileEmailInput.value,
      };

      try {
        const updateResponse = await updateUserData(updatedUserData, token);

        // Use updated user data from response
        const user = updateResponse.data;

        addUserDataToDom(user);
      } catch (error) {
        console.error('Failed to update user data:', error);
      }
    } else {
      console.error('No token found. Please log in.');
    }
  });
}

// upload avatar function
const uploadAvatar = async (
  file: File,
  token: string
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(`${apiUrl}/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Avatar upload failed');
    }

    const data: UploadResult = await response.json();
    return data;
  } catch (error) {
    console.error('Upload avatar failed:', error);
    throw error;
  }
};

// avatar form event listener
if (avatarForm) {
  avatarForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    if (token && avatarInput.files && avatarInput.files[0]) {
      const file = avatarInput.files[0];

      try {
        await uploadAvatar(file, token);

        // Fetch the updated user data
        const user = await getUserData(token);

        addUserDataToDom(user);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    } else {
      console.error('No token found or no file selected.');
    }
  });
}
