
let pve = importModule("ProxmoxAPI");
let private = importModule("PrivateData");

//You can edit these or create your own private module
let password = private.password;
let username = private.username;

let proxmoxURL = "https://192.168.1.25";
let client = new pve.PveClient(proxmoxURL);

let nodeOrVmName = args.widgetParameter;

//I only have one node, so enabling this clones the single node to test multi node UI
let debugMulti = false;
if( nodeOrVmName == "multiTest"){
	debugMulti = true;
}

let colors = [Color.purple(), Color.blue(), Color.orange(), Color.brown(), Color.cyan(), Color.magenta(), Color.yellow()]

let nodes = await loadNodes();
let widget = await createWidget(nodes);

if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentLarge()
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(nodes) {
  let widget = new ListWidget()
	let now = new Date();
  let seconds_in_future = 10 * 1000;
  now.setTime(now.getTime() + seconds_in_future );
  //Hopefully this forces the widget to update more frequently for close to real-time
	widget.refreshAfterDate = now;

  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("262626")
  ]
  widget.backgroundGradient = gradient
  let widgetInfo = widget.addStack();
  let updatedStack = widgetInfo.addText("Widget updated @"+new Date().toLocaleTimeString()+ " next: "+now.toLocaleTimeString());
  updatedStack.textColor = Color.orange()
  updatedStack.textOpacity = 0.9;
  updatedStack.font = Font.mediumSystemFont(13);
  
  if( nodeOrVmName !== undefined){
    let nodeFound = findNode(nodeOrVmName, nodes);
  	if ( nodeFound != undefined){
      return oneNodeUI(widget, nodeFound)
    }
    let vmFound = findVM(nodeOrVmName, nodes);
    if (vmFound != undefined){
      return singleVMUI(widget, vmFound.node, vmFound.VM);
    }
  }
  
  if(nodes.length > 1){
		await multipleNodesUI(widget, nodes);
  }else{
    await oneNodeUI(widget, nodes[0]);
  }
  return widget
}
async function singleVMUI(widget, node, vm){
  let VM = vm;
  //Stack for single VM name and status
  let TitleStack = widget.addStack();
  TitleStack.borderColor = Color.orange()
  TitleStack.borderWidth = 0.5
  let UptimeStack = widget.addStack();
  let nameElement = TitleStack.addText("Status of "+VM.name+":");
  nameElement.textColor = Color.white();
  nameElement.font = Font.mediumSystemFont(25);
	let statusElement = TitleStack.addText(" "+VM.status);
  statusElement.textColor = (VM.status == "running") ? Color.green() : Color.red();
  statusElement.font = Font.mediumSystemFont(25);
  
  let Detail1 = widget.addStack();
  let memUsed = VM.mem;
  let memTotal = VM.maxmem;
  let mem_Text_Size = 14
  let mem_opacity = 0.7;
  let mem_Default_color = Color.white();
  let mem_Special_color = Color.green();
  let mem = Detail1.addText("mem used:");
  mem.textColor = mem_Default_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  mem = Detail1.addText(String(Math.floor((memUsed/memTotal)*100)));
  mem.textColor = mem_Special_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  mem = Detail1.addText("% (");
  mem.textColor = mem_Default_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  mem = Detail1.addText(Math.floor((memUsed / 1000000) * 100) / 100+" MB");
  mem.textColor = mem_Special_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  mem = Detail1.addText("/");
  mem.textColor = mem_Default_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  mem = Detail1.addText(Math.floor((memTotal / 1000000) * 100) / 100+" MB");
  mem.textColor = mem_Special_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  mem = Detail1.addText(")");
  mem.textColor = mem_Default_color
  mem.textOpacity = mem_opacity
  mem.font = Font.mediumSystemFont(mem_Text_Size)
  
  let NetDetail = widget.addStack();
  let netin_to_MB = Math.floor((VM.netin / 1000000) * 100) / 100;
  let netout_to_MB = Math.floor((VM.netout / 1000000) * 100) / 100;
  let net_default_size = 15
  let net_opacity = 0.7;
  let net_default_color = Color.white();
  let net_special_color = Color.green();
  //Splits text on same text in order to color the numbers
  let net = NetDetail.addText("net usage ");
  net.textColor = net_default_color
  net.textOpacity = net_opacity
  net.font = Font.mediumSystemFont(net_default_size)
  net = NetDetail.addText(String(netin_to_MB));
  net.textColor = net_special_color
  net.textOpacity = net_opacity
  net.font = Font.mediumSystemFont(net_default_size)
  net = NetDetail.addText(" MB in, ");
  net.textColor = net_default_color
  net.textOpacity = net_opacity
  net.font = Font.mediumSystemFont(net_default_size)
  net = NetDetail.addText(String(netout_to_MB));
  net.textColor = net_special_color
  net.textOpacity = net_opacity
  net.font = Font.mediumSystemFont(net_default_size)
  net = NetDetail.addText(" MB out");
  net.textColor = net_default_color
  net.textOpacity = net_opacity
  net.font = Font.mediumSystemFont(net_default_size)
  let Config_net_stack = widget.addStack();
  let config_net = Config_net_stack.addText("Net config: "+VM.config.net0);
  config_net.textColor = Color.white()
  config_net.textOpacity = 0.7
  config_net.font = Font.mediumSystemFont(13)
  let Cpu_stack = widget.addStack();
  let cpu = Cpu_stack.addText(VM.cpus+" cpus, cpu usage ")
	let cpu_text_size = 13;
  let cpu_default_color = Color.white();
  let cpu_special_color = Color.green();
  let cpu_opacity = 0.7
  cpu.textColor = cpu_default_color
  cpu.textOpacity = cpu_opacity
  cpu.font = Font.mediumSystemFont(cpu_text_size)
  cpu = Cpu_stack.addText((VM.cpu / VM.cpus).toFixed(3)+ "% ")
  cpu.textColor = cpu_special_color
  cpu.textOpacity = cpu_opacity
  cpu.font = Font.mediumSystemFont(cpu_text_size)
  cpu = Cpu_stack.addText("("+VM.cpu.toFixed(4)+" / "+VM.cpus+")");
  cpu.textColor = cpu_default_color
  cpu.textOpacity = cpu_opacity
  cpu.font = Font.mediumSystemFont(cpu_text_size)
  if (VM.status == "running"){
    let uptime = UptimeStack.addText("Uptime: "+getTime(VM.uptime));
    uptime.textColor = Color.white();
    uptime.font = Font.mediumSystemFont(13);
    widget.addSpacer(2)
  }
  return widget;
}

function findNode(nodeName, inNodes){
  for (let nodeIndex in nodes){
		let node = nodes[nodeIndex];
    if( node.node == nodeName){
      return node;
    }
  }
}
function findVM(VMName, inNodes){
	for (let nodeIndex in nodes){
  	let node = nodes[nodeIndex];
    for( let index in node.VMs){
      let vm = node.VMs[index];
      if(vm.name == VMName){
        return {VM: vm, node: node};
      }
    }
  }
}

async function oneNodeUI(widget, node){
  let MAX_NODES_TO_SHOW = 5;
  let titleStack = widget.addStack()
  let statStack = widget.addStack();
  let newdetailStack = widget.addStack();
  let detailStack = widget.addStack();
  let statData = node.status;
  let memUsed = statData.memory.used;
  let memTotal = statData.memory.total;
  let mem = statStack.addText("mem used: "+Math.floor((memUsed/memTotal)*100)+"% ("+memUsed+"/"+memTotal+")");
  mem.textColor = Color.white()
  mem.textOpacity = 0.7
  mem.font = Font.mediumSystemFont(13)
  let titleElement = titleStack.addText("Only showing "+MAX_NODES_TO_SHOW+" out of "+node.VMs.length+" VMs on node "+node.node);
  titleElement.textColor = Color.white()
  titleElement.textOpacity = 0.7
  titleElement.font = Font.mediumSystemFont(13)
  let uptime = detailStack.addText("node uptime: "+getTime(node.uptime));
  uptime.textColor = Color.white();
  uptime.textOpacity = 0.7
  uptime.font = Font.mediumSystemFont(13);
  let Statuses = await GetAllVMsProperty(node.VMs, "status");
  let statuStack = widget.addStack();
  let statTile = statuStack.addText("VMs ");
  statTile.textColor = Color.white();
  statTile.textOpacity = 0.7
  statTile.font = Font.mediumSystemFont(13);
  for (key in Statuses) {
		let occurenceAmount = Statuses[key];
    let statElement = statuStack.addText(" "+key+" : "+occurenceAmount);
    statElement.textColor = (key == "running") ? Color.green() : Color.red();
    statElement.textOpacity = 0.7
    statElement.font = Font.mediumSystemFont(13)
	}
  widget.addSpacer(12)
  for( let index in node.VMs){
    if (index > MAX_NODES_TO_SHOW){ break; }
    let VM = node.VMs[index];
    //Stack for single VM name and status
    let VMStack = widget.addStack();
    let nameElement = VMStack.addText(VM.name);
    nameElement.textColor = Color.white();
    nameElement.font = Font.mediumSystemFont(13);
    let dashes = VMStack.addText(" --- ");
    dashes.textColor = Color.white();
    dashes.font = Font.mediumSystemFont(13);
  	let statusElement = VMStack.addText(VM.status);
    statusElement.textColor = (VM.status == "running") ? Color.green() : Color.red();
    statusElement.font = Font.mediumSystemFont(13);
    if (VM.status == "running"){
      let uptime = VMStack.addText(" uptime: "+getTime(VM.uptime));
      uptime.textColor = Color.white();
      uptime.font = Font.mediumSystemFont(13);
      widget.addSpacer(2)
    }
//     let net = VMStack.addText(" net: "+VM.config.net0);
//     net.textColor = Color.white();
//     net.font = Font.mediumSystemFont(13);
//     widget.addSpacer(2)
  }
  let logs = await GetNodeLogs(node.node);
  let Log_title_stack = widget.addStack();
	let title = Log_title_stack.addText("NODE LOGS");
  title.textColor = Color.white();
  title.font = Font.mediumSystemFont(20);
  let Num_Logs_To_Show = 6
  for ( let i = Num_Logs_To_Show; i > 0; i--){
    console.log(i);
    let Log_Line1_Stack = widget.addStack();
    let first_line = Log_Line1_Stack.addText(logs[logs.length - (i + 1)].t);
    first_line.textColor = colors[i];
    first_line.font = Font.mediumSystemFont(8);
  }
  return widget;
}

async function multipleNodesUI(widget, nodes){
  let colorIndex = 0;
  // Show app icon and title
	for (let nodeIndex in nodes){
    if (colorIndex == colors.length){ colorIndex = 0; }
    let node = nodes[nodeIndex];
    let table = widget
    let titleStack = widget.addStack()
    let statStack = widget.addStack();
    let statData = node.status;
    let memUsed = statData.memory.used;
    let memTotal = statData.memory.total;
    let mem = statStack.addText("mem used: "+Math.floor((memUsed/memTotal)*100)+"% ("+memUsed+"/"+memTotal+")");
    mem.textColor = colors[colorIndex];
    mem.textOpacity = 0.7
    mem.font = Font.mediumSystemFont(13)
    let titleElement = titleStack.addText("Status of node "+node.node+" uptime: "+getTime(node.uptime));
    titleElement.textColor = colors[colorIndex];
    titleElement.textOpacity = 0.7
    titleElement.font = Font.mediumSystemFont(13)
    let Statuses = await GetAllVMsProperty(node.VMs, "status");
    let statuStack = widget.addStack();
    let statTile = statuStack.addText("VMs ");
    statTile.textColor = colors[colorIndex];
    statTile.textOpacity = 0.7
    statTile.font = Font.mediumSystemFont(13);
    for (key in Statuses) {
  		let occurenceAmount = Statuses[key];
      let statElement = statuStack.addText(" "+key+" : "+occurenceAmount);
      statElement.textColor = (key == "running") ? Color.green() : Color.red();
      statElement.textOpacity = 0.7
      statElement.font = Font.mediumSystemFont(13)
      statElement.shadowColor = colors[colorIndex];
      statElement.shadowRadius = 1;
  	}
    widget.addSpacer(10);
		colorIndex += 1;
  }
  return widget
}

async function loadNodes() {
  
    client.logEnabled = true;
    //client.apiToken = "3049c8dc-7655-45ad-b494-1ef67c6084fe"
    let login = await client.login(username, password, 'pam');
    if (login) {
      let serverData = {};
      let allNodes = (await client.nodes.index()).response.data;
      for (nodeIndex in allNodes){
        let nodeName = allNodes[nodeIndex].node;
        let status = await GetStat(nodeName);
        let nodeVMs = await GetVMs(nodeName);
        allNodes[nodeIndex].status = status;
        allNodes[nodeIndex].VMs = nodeVMs;
      }
      if( debugMulti) {
        //Adds multiple copies of the same node for debugging
        let copy = allNodes[0];
        allNodes.push(copy);
        allNodes.push(copy);
        allNodes.push(copy);
      }
//      console.warn(allNodes);
      return allNodes;
    }
  return [];
}
async function GetNodeLogs(nodeName){
	return (await client.nodes.get(nodeName).syslog.syslog(5)).response.data;
}
async function GetAllVMsProperty(VMs, property){
  let occurences = {};
  for( let index in VMs){
    	let vm = VMs[index];
      let propValue = vm[property];
      if (occurences[propValue] !== undefined){
        occurences[propValue] += 1;
      }else{
        occurences[propValue] = 1;
      }
    }
  return occurences;
}
function getTime(fromSeconds){
  let minutes = Math.floor((fromSeconds / 60) * 100) / 100;
  let hours = Math.floor((minutes / 60) * 100) / 100;
  if( minutes > 60){
    return hours+" hours";
  }
  return minutes+" minutes"
}
async function GetStat(onNode){
  return (await client.nodes.get(onNode).status.status()).response.data;
}
async function GetVMs(onNode){
  let VMS = (await client.nodes.get(onNode).qemu.vmlist(0)).response.data;
	for (VMIndex in VMS) {
    let vm = VMS[VMIndex];
    let vmnodeid = (await client.nodes.get(onNode).qemu.get(vm.vmid))
    let conf = (await vmnodeid.config.vmConfig(true)).response.data;
    vm.config = conf;
  }
  return VMS;
}
