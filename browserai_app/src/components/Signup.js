import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, TextField, Button, Card, CardContent } from '@material-ui/core';
import { useAuth } from "../contexts/AuthContext"
import { Link, useHistory } from "react-router-dom"
import logo from '../assets/logo_bg.png'

const styles = {
  title: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '64px',
    fontWeight: '500',
    background: 'linear-gradient(45deg, #FF99CC 10%, #33FFCC 50%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '4px',
  },
  emoji: {
    fontSize: '64px'
  },
  slogan: {
    fontFamily: 'Roboto Slab, sans-serif',
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#FFFFFF',

  },
  description: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '18px',
    marginBottom: '20px',
    color: '#AAAAAA',
  },
  addToChromeButton: {
    maxWidth: '60%',
    marginTop: '10px',
    padding: '10px 24px',
    background: '#4caf50',
    color: '#ffffff',
    borderRadius: '18px',
    fontSize: '18px',
    textTransform: 'none',
    fontFamily: 'DM Sans, sans-serif',
    '&:hover': {
      background: '#45a049',
    }
  },
  cardHeader: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '20px',
    letterSpacing: '2px',
    color: '#45a049',
    marginLeft: '15%',
  },
  errorH: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    letterSpacing: '1px',
    color: 'red',
  },

};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundImage: 'linear-gradient(to right, #15171A, #1E2125)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '20px',
  },
  logoContainer: {
    position: 'absolute',
    top: '20px',
    left: '20px',
  },
  logo: {
    width: '140px',
    marginBottom: '20px',
    top: 0
  },
  header: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  contentWrapper: {
    display: 'flex',
    width: '90%',
    margin: '10%',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  leftContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '40%',
    // alignItems: 'center',
  },
  rightContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '60%',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: '20px',
      marginLeft: 0,
    },
  },
  loginCard: {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
    margin: 'auto'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: '20px',
  },
  formField: {
    width: '100%',
    marginBottom: '10px',
  },
  loginButton: {
    marginTop: '10px',
    padding: '12px 24px',
    background: '#4caf50',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
      background: '#45a049',
    },
  },
  signUp: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#4caf50',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    '&:hover': {
      color: '#45a049',
    },
  },
}));

export default function Signup() {

  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }

    try {
      setError("")
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      history.push("/")
    } catch {
      setError("Invalid EmailID or Password")
    }

    setLoading(false)
  }

  const classes = useStyles();
  const description = "BrowserAI is a powerful Chrome extension that allows you to enhance your selected text with AI-powered prompts. Whether you want to improve your writing, generate creative responses, or save time crafting replies, BrowserAI has got you covered. With seamless integration and easy-to-use prompts, take your text to the next level effortlessly."
  return (
    <div className={classes.root}>
      <div className={classes.logoContainer}>
        <img
          src={logo}
          alt="Logo"
          className={classes.logo}
        />
      </div>
      <div className={classes.contentWrapper}>
        <div className={classes.leftContent}>
          <div className={classes.header}>
            <Typography style={styles.title}>
              BrowserAI
            </Typography>
            <span style={styles.emoji}>
              🚀️
            </span>
          </div>
          <Typography style={styles.slogan}>
            Elevate Your Text, Instantly!
          </Typography>
          <Typography style={styles.description}>
            {description}
          </Typography>
          <Button
            style={styles.addToChromeButton}
            disableElevation
          >
            Add to Chrome - Now ! ✨️
          </Button>
        </div>

        <div className={classes.rightContent}>
          <Card className={classes.loginCard}>
            <CardContent>
              <Typography style={styles.cardHeader}>
                Create Your Account
              </Typography>

              <form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  inputRef={emailRef}
                  required
                  className={classes.formField}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  inputRef={passwordRef}
                  required
                  className={classes.formField}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  inputRef={passwordConfirmRef}
                  required
                  className={classes.formField}
                />
                {error && <Typography style={styles.errorH}>{error}</Typography>}
                <Button
                  disabled={loading}
                  className={classes.loginButton}
                  variant="contained"
                  type="submit"
                  disableElevation
                >
                  Sign Up
                </Button>
              </form>
            </CardContent>
            <div className="w-100 text-center mt-2">
              Already have an account?{" "}
              <Link to="/login">Log In</Link>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};