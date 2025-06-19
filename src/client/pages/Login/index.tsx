import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../../templates/dist/assets/compiled/png/login.png'

function Login() {
    const nav = useNavigate();

    const [errorText, setErrorText] = useState<{ status: number, message: string }>({ status: 0, message: '' })
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [isDark, setIsDark] = useState(
        document.documentElement.getAttribute('data-bs-theme') === 'dark'
    );

    const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorText({ status: 0, message: '' })

        try {
            const res = await fetch('http://localhost:3000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const status = res.status;
            const data = await res.json();

            // console.log(data.data.username);
            
            if (res.ok && data.status) {
                localStorage.setItem('auth', JSON.stringify(data.data.token));
                localStorage.setItem('user', data.data.username);
                nav('/', { replace: true });
            } else {
                setErrorText({ status, message: data.message });

                if (username !== '' && password !== '') {
                    alert(`${data.message}`);
                }
            }
        } catch (error) {
            alert('Gagal login: ' + error);
        }
    };


    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        setIsDark(savedTheme === 'dark');

        if (localStorage.getItem('auth')) {
            nav('/');
        }
    }, []);

    return (
        <div id="auth">
            <div className="row h-100">
                <div className="col-lg-5 col-12">
                    <div id="auth-left">
                        <div className="logo"></div>
                        <h1 className="auth-title">
                            <Link to={'/login'}>Sebar.in</Link>
                        </h1>
                        <p className="auth-subtitle mb-5">Log in with your data that you entered during registration.</p>
                        <form onSubmit={onLogin}>
                            <div className="form-group position-relative has-icon-left mb-4">
                                <input type="text" className="form-control form-control-xl" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                                <div className="form-control-icon">
                                    <i className="bi bi-person"></i>
                                </div>
                                {errorText.status === 400 && username === '' && (
                                    <>
                                        <span className='text-danger'>
                                            Username must be filled
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="form-group position-relative has-icon-left mb-4">
                                <input type="password" className="form-control form-control-xl" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                                <div className="form-control-icon">
                                    <i className="bi bi-shield-lock"></i>
                                </div>
                                {errorText.status === 400 && password === '' && (
                                    <>
                                        <span className='text-danger'>
                                            Password must be filled
                                        </span>
                                    </>
                                )}
                            </div>
                            <button className="btn btn-primary btn-block btn-lg shadow-lg mt-5" id="btn-login">Log in</button>
                        </form>
                    </div>
                </div>
                <div className="col-lg-7 my-auto">
                    <div className="d-flex justify-content-center">
                        <img className="img-fluid" width="80%" src={loginImage} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login