# ScriptableProxmox
A widget script for the Scriptable app on Iphone. You can:
  1. View a limited amount of nodes at a time, its status, uptime and VMs running/down
  2. View a specific node, running VMs, all VMs running/down and a limited amount of logs
  3. View a specific VM details such as status, uptime, net usage, mem usage, net configs and CPU usage

# How do i get started
You first need to grab your proxmox login info and then either

  A) Create a "PrivateData" module that returns:
  
    `module.exports = {username: "root", password: "supersecret"}`
    
  or B) Delete the "PrivateData" variable and edit the username and password variables directly

You will also need to create new modules for all the scripts in this repo (minus the README of course) and name them just as their filename. If you want to thank the original authors, their github is at the top of the scripts.

# Different Widgets
To get a different type of widget you need to pass an argument when editing the widget. You can pass a node name or a VM name, it will then look for them, it will first look for the node and then VM list if it's not found in the node list. If you have a VM that conflicts with a node, it will return the node first.

If you want to view the multi-node list, you can pass "multiTest" as the argument, this will copy the first node multiple times. I suggest you only do this if you don't have more than one node, doing so would make your multi-node list view look not so pretty.

# ScriptableProxmox pseudo code
```
Passed Arguments?
|\_No
|  |\_Has More than one node?
|    |\_No
|    |  |\_Display Single Node View
|    |\_Yes
|       |\_Display multi Node view
|\_Yes
   |\_Is arg multiTest?
   |  |\_Yes
   |     |\_ Clone first node multiple times
   |\_Is arg a node?
   |  |\_Yes
   |    |\_Display Single node View
   |\_Is arg a VM
      |\_Yes
        |\_Display Vm view
```
<p align="center">
  <img src="https://github.com/mawesome4ever/Dependancies/blob/master/IMG_B2AC873952BD-1.jpeg" width="350" title="output">
</p>
