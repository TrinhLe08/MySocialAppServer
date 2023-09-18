import express from "express";

const configViewEngine = (app) => {
    app.use(express.static('./src/public'))
}

export default configViewEngine