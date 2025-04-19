class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); 
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); 
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        
        this.engine.show(locationData.Body); 
        
        if(locationData.Choices && typeof(locationData.Choices) != String) { 
            for(let choice of locationData.Choices) { 
                if(this.engine.storyData.Locations[choice.Target].NeedsKey){
                    if(this.engine.storyData.KeyList[this.engine.storyData.Locations[choice.Target].NeedsKey] == 0){
                        //this.engine.storyData.KeyList[this.engine.storyData.Locations[choice.Target].NeedsKey] = 1;

                        this.engine.addChoice(choice.Text, {"Text": "You need [" + this.engine.storyData.Locations[choice.Target].NeedsKey + "] to enter this area.", "Target": key});
                    }else if(this.engine.storyData.KeyList[this.engine.storyData.Locations[choice.Target].NeedsKey] == 1){
                        this.engine.storyData.KeyList[this.engine.storyData.Locations[choice.Target].NeedsKey] = 2;
                        this.engine.addChoice(choice.Text, {"Text": "You unlocked the door with your [" + this.engine.storyData.Locations[choice.Target].NeedsKey + "].", "Target": choice.Target});
                    }else{
                        this.engine.addChoice(choice.Text, choice);
                    }
                }else{
                    this.engine.addChoice(choice.Text, choice); 
                }
                
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice) {
            console.log(choice);
            this.engine.show("&gt; "+choice.Text);
            if(choice.HasMechanism){
                this.engine.gotoScene(Mechanism, choice.HasMechanism);
            }else{
                this.engine.gotoScene(Location, choice.Target);
            }
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class Mechanism extends Scene {
    create(key){
        let mData = this.engine.storyData.Mechanisms[key];
        
        this.engine.show(mData.Body); 
        if(mData.Type == "Password"){
            if(mData.Choices && typeof(mData.Choices) != String) {
                if(mData.CurrentDigit < mData.NumDigits){
                    for(let choice of mData.Choices) {
                        this.engine.addChoice(choice.Text, {"ChoiceKey": key, "ChoiceText": choice.Text, "ChoiceTarget": choice.Target});
                    }
                }else{
                    mData.CurrentDigit = 0;
                    if(mData.LastPassword == mData.RealPassword){
                        mData.LastPassword = "";
                        this.engine.show("Correct password.");
                        this.engine.gotoScene(Location, mData.GoTo);
                    }else{
                        mData.LastPassword = "";
                        this.engine.show("Wrong password.");
                        this.engine.gotoScene(Location, mData.FromLocation);
                    }
                }
            }
        }else if(mData.Type == "Key"){
            this.engine.storyData.KeyList[mData.GetKey] = 1;
            this.engine.gotoScene(Location, mData.FromLocation);
        }else{
            this.engine.gotoScene(Location, mData.FromLocation);
        }
    }

    handleChoice(choice){
        let mData = this.engine.storyData.Mechanisms[choice.ChoiceKey];

        if(mData.Type == "Password"){
            mData.CurrentDigit += 1;
            mData.LastPassword = mData.LastPassword + choice.ChoiceTarget;
            this.engine.show("&gt; "+ mData.LastPassword);
            this.engine.gotoScene(Mechanism, choice.ChoiceKey);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');