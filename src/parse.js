const parseSave = new Promise((resolve, reject) => {
    const fs = require('fs')
    const pako = require('pako')
    const { getName } = require('./names')
    const path = require('path')

    function decodeSave(a) {
        let b = ''
        a = String(a).split('').map(l => l.charCodeAt())
        a.forEach(c => b += String.fromCodePoint(c ^ 11))
        b = Buffer.from(b, 'base64')
        return new TextDecoder('utf-8').decode(pako.ungzip(b))
    }

    function parseLevelString(e) {
        let r = {}
        e = e.split(',')
        for (let i = 0; i < e.length; i += 2) r[e[i]] = e[i + 1]
        return r
    }

    let blacklist = [
        'buttonRows',
        'buttonsPerRow'
    ]

    fs.readFile(`${process.env.LOCALAPPDATA}/GeometryDash/CCGameManager.dat`, null, (err, data) => {
        if (err) throw err + ' (Do you have the game installed?)'

        let file = decodeSave(data)
        let json = {}

        json.bgVolume = file.match(/<k>bgVolume<\/k><r>([\d\.]+)<\/r>/)[1] * 100 + '%'
        json.sfxVolume = file.match(/<k>sfxVolume<\/k><r>([\d\.]+)<\/r>/)[1] * 100 + '%'
        json.UDID = file.match(/<k>playerUDID<\/k><s>([\w-]+)<\/s><k>/)[1]
        json.name = file.match(/<k>playerName<\/k><s>(\w+)<\/s><k>/)[1]
        try { json.password = file.match(/<k>GJA_002<\/k><s>(\w+)<\/s><k>/)[1] } catch {}
        try { json.userID = parseInt(file.match(/<k>playerUserID<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        try { json.accountID = parseInt(file.match(/<k>GJA_003<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        json.cube = parseInt(file.match(/<k>playerFrame<\/k><i>(\d+)<\/i>/)[1])
        json.ship = parseInt(file.match(/<k>playerShip<\/k><i>(\d+)<\/i>/)[1])
        json.ball = parseInt(file.match(/<k>playerBall<\/k><i>(\d+)<\/i>/)[1])
        json.UFO = parseInt(file.match(/<k>playerBird<\/k><i>(\d+)<\/i>/)[1])
        json.wave = parseInt(file.match(/<k>playerDart<\/k><i>(\d+)<\/i>/)[1])
        json.robot = parseInt(file.match(/<k>playerRobot<\/k><i>(\d+)<\/i>/)[1])
        json.spider = parseInt(file.match(/<k>playerSpider<\/k><i>(\d+)<\/i>/)[1])
        try { json.color1 = parseInt(file.match(/<k>playerColor<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        json.color2 = parseInt(file.match(/<k>playerColor2<\/k><i>(\d+)<\/i>/)[1])
        json.trail = parseInt(file.match(/<k>playerStreak<\/k><i>(\d+)<\/i>/)[1])
        json.deathEffect = parseInt(file.match(/<k>playerDeathEffect<\/k><i>(\d+)<\/i>/)[1])
        try { json.playerIconType = parseInt(file.match(/<k>playerIconType<\/k><i>(\d+)<\/i>/)[1]) } catch { json.playerIconType = 0 }
        try { json.playerGlow = file.match(/<k>playerGlow<\/k><([tf]) \/>/)[1] == 't' } catch { json.playerGlow = false }
        try { json.cod3breaker = parseInt(file.match(/<k>secretNumber<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        try { json.moderator = file.match(/<k>hasRP<\/k><([tf]) \/>/)[1] == 't' } catch { json.moderator = false }

        json.valueKeeper = {}

        let gv = file.match(/<k>gv_[\w-]+<\/k><s>\d+<\/s>/g)
        for (let i = 0; i < gv.length; i++) {
            let match = gv[i].match(/<k>(gv_[\w-]+)<\/k><s>(\d+)<\/s>/)
            let response = blacklist.includes(getName(match[1])) || getName(match[1]).startsWith('gv_1000') || getName(match[1]).startsWith('gv_gradient') || getName(match[1]).startsWith('gv_comentarios') || getName(match[1]).startsWith('gv_tabla') ? parseInt(match[2]) : match[2] == '1'
            json.valueKeeper[getName(match[1])] = response
        }

        let cube = file.match(/<k>i_\d+<\/k><s>\d+<\/s>/g)
        if (cube != null) {
            json.valueKeeper.cubes = []
            for (let i = 0; i < cube.length; i++) {
                let match = cube[i].match(/<k>i_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.cubes.push(parseInt(match[1]))
            }
        }

        let ship = file.match(/<k>ship_\d+<\/k><s>\d+<\/s>/g)
        if (ship != null) {
            json.valueKeeper.ships = []
            for (let i = 0; i < ship.length; i++) {
                let match = ship[i].match(/<k>ship_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.ships.push(parseInt(match[1]))
            }
        }

        let ball = file.match(/<k>ball_\d+<\/k><s>\d+<\/s>/g)
        if (ball != null) {
            json.valueKeeper.balls = []
            for (let i = 0; i < ball.length; i++) {
                let match = ball[i].match(/<k>ball_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.balls.push(parseInt(match[1]))
            }
        }

        let UFO = file.match(/<k>bird_\d+<\/k><s>\d+<\/s>/g)
        if (UFO != null) {
            json.valueKeeper.UFOs = []
            for (let i = 0; i < UFO.length; i++) {
                let match = UFO[i].match(/<k>bird_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.UFOs.push(parseInt(match[1]))
            }
        }

        let wave = file.match(/<k>dart_\d+<\/k><s>\d+<\/s>/g)
        if (wave != null) {
            json.valueKeeper.darts = []
            for (let i = 0; i < wave.length; i++) {
                let match = wave[i].match(/<k>dart_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.darts.push(parseInt(match[1]))
            }
        }

        let robot = file.match(/<k>robot_\d+<\/k><s>\d+<\/s>/g)
        if (robot != null) {
            json.valueKeeper.robots = []
            for (let i = 0; i < robot.length; i++) {
                let match = robot[i].match(/<k>robot_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.robots.push(parseInt(match[1]))
            }
        }

        let trail = file.match(/<k>special_\d+<\/k><s>\d+<\/s>/g)
        if (trail != null) {
            json.valueKeeper.trails = []
            for (let i = 0; i < trail.length; i++) {
                let match = trail[i].match(/<k>special_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.trails.push(parseInt(match[1]))
            }
        }

        json.valueKeeper.colors = {}

        let c1 = file.match(/<k>c0_\d+<\/k><s>\d+<\/s>/g)
        if (c1 != null) {
            json.valueKeeper.colors.c1 = []
            for (let i = 0; i < c1.length; i++) {
                let match = c1[i].match(/<k>c0_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.colors.c1.push(parseInt(match[1]))
            }
        }

        let c2 = file.match(/<k>c1_\d+<\/k><s>\d+<\/s>/g)
        if (c2 != null) {
            json.valueKeeper.colors.c2 = []
            for (let i = 0; i < c2.length; i++) {
                let match = c2[i].match(/<k>c1_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.colors.c2.push(parseInt(match[1]))
            }
        }

        let ugv = file.match(/<k>ugv_[\w-]+<\/k><s>\d+<\/s>/g)
        if (ugv != null) {
            json.unlockValueKeeper = {}
            for (let i = 0; i < ugv.length; i++) {
                let match = ugv[i].match(/<k>(ugv_[\w-]+)<\/k><s>(\d+)<\/s>/)
                let name = getName(match[1])
                json.unlockValueKeeper[getName(match[1])] = parseInt(match[2]) == 1
            }
        }

        let reportedAchievements = file.match(/<k>geometry\.ach\.\w+<\/k><s>\d+<\/s>/g)
        if (reportedAchievements != null) {
            json.achievements = {}
            for (let i = 0; i < c2.length; i++) {
                let match = reportedAchievements[i].match(/<k>geometry\.ach\.(\w+)<\/k><s>(\d+)<\/s>/)
                json.achievements[getName(match[1])] = match[2] + '%'
            }
        }

        try { json.showGuidelines = file.match(/<k>showSongMarkers<\/k><([tf]) \/>/)[1] == 't' } catch { json.showGuidelines = false }
        try { json.showProgressBar = file.match(/<k>showProgressBar<\/k><([tf]) \/>/)[1] == 't' } catch { json.showProgressBar = false }
        json.clickedIconKit = file.match(/<k>clickedGarage<\/k><([tf]) \/>/)[1] == 't'
        json.clickedEditor = file.match(/<k>clickedEditor<\/k><([tf]) \/>/)[1] == 't'
        json.clickedPractice = file.match(/<k>clickedPractice<\/k><([tf]) \/>/)[1] == 't'
        try { json.showedEditorGuide = file.match(/<k>showedEditorGuide<\/k><([tf]) \/>/)[1] == 't' } catch { json.showedEditorGuide = false }
        try { json.showedLowDetailDialog = file.match(/<k>showedLowDetailDialog<\/k><([tf]) \/>/)[1] == 't' } catch { json.showedLowDetailDialog = false }
        json.bootups = parseInt(file.match(/<k>bootups<\/k><i>(\d+)<\/i><k>/)[1])
        try { json.ratedGame = file.match(/<k>hasRatedGame<\/k><([tf]) \/>/)[1] == 't' } catch { json.ratedGame = false }
        json.binary = parseInt(file.match(/<k>binaryVersion<\/k><i>(\d+)<\/i><k>/)[1])
        try { json.resolution = parseInt(file.match(/<k>resolution<\/k><i>(\d+)<\/i><k>/)[1]) } catch {}
        try { json.textQuality = parseInt(file.match(/<k>texQuality<\/k><i>(\d+)<\/i><k>/)[1]) } catch {}

        let stats = file.match(/<k>GS_value<\/k><d>(.+)<\/d><k>GS_completed<\/k>/)[1].match(/<k>\d+<\/k><s>\d+<\/s>/g).map(e => e.match(/<k>(\d+)<\/k><s>(\d+)<\/s>/))
        json.stats = {}
        for (let i = 0; i < stats.length; i++) {
            let match = stats[i]
            json.stats[getName(`gs_${match[1]}`)] = parseInt(match[2])
        }
        json.stats.demonKeys = parseInt(file.match(/<k>GS_20<\/k><i>(\d+)<\/i>/)[1])

        let purchased = file.match(/<k>GS_6<\/k><d>(.+)<\/d><k>GS_7<\/k>/)[1].match(/<k>\d+<\/k><s>\d+<\/s>/g).map(e => e.match(/<k>(\d+)<\/k><s>(\d+)<\/s>/))
        json.purchased = {}
        for (let i = 0; i < purchased.length; i++) {
            let match = purchased[i]
            json.purchased[getName(`item_${match[1]}`)] = parseInt(match[2])
        }

        resolve({ file: file, json: json })
    })
})

exports.parseSave = parseSave