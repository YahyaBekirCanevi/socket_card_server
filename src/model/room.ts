export default class Room {
    name!: string
    users!: string[]

    constructor(playerName: string) {
        this.name = `${playerName} 's Room`
        this.users = []
    }
}

// Set up a map of rooms
export const rooms: { [key: string]: Room } = {}