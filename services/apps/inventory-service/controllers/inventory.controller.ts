class Inventory {
    private static instace : Inventory | null;
    
    static getInstance() {
        if(!this.instace) this.instace = new Inventory()
        return this.instace;
    }

    
}   

const InventoryController = Inventory.getInstance()

export default InventoryController;