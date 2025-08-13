class Notification {
    private static instance : Notification | null;

    static getInstance() {
        if(this.instance) this.instance = new Notification()
            
        return this.instance;
    }
}

const NotificationController = Notification.getInstance()

export default NotificationController